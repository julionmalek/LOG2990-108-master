import { Component, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { KickoutDialogComponent } from '@app/components/kickout-dialog/kickout-dialog.component';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { DataService } from '@app/services/data.service/data.service';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { RoomService } from '@app/services/room.service/room.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { DURATION } from '@utilities/constants';
import { Subject, map, takeUntil, tap } from 'rxjs';

interface Player {
    id: string;
    name: string;
}
const COUNTDOWN_DURATION = 5;

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent implements OnInit, OnDestroy {
    @ViewChild('chat') chatSidebar: MatSidenav;
    gameId: string;
    playerName: string = '';
    isOrganizer: boolean = false;
    isLocked: boolean = false;
    players: Player[] = [];
    private allowRedirectWithoutConfirm = false;
    private countdown: number;
    private title: string;
    private gameStarted: boolean = false;
    private destroy$ = new Subject<void>();

    constructor(private injector: Injector) {}

    @HostListener('window:unload', ['$event'])
    unloadHandler(): void {
        this.leaveRoom();
    }

    getCountdown(): number {
        return this.countdown;
    }

    getTitle(): string {
        return this.title;
    }

    getGameStarted(): boolean {
        return this.gameStarted;
    }

    ngOnInit() {
        this.setupPage();

        this.injector.get(DirectNavigationService).revokeAccess();

        this.injector
            .get(WebsocketService)
            .listenForRoomClosure()
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                this.allowRedirectWithoutConfirm = true;
                this.showDialog(message);
            });
        this.injector.get(RoomService).setRoomId(this.gameId); // Set the gameId in the service
        this.injector.get(RoomService).setIsOrganizer(this.isOrganizer);
        this.injector.get(SidebarService).openChat();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.injector.get(SidebarService).closeChat();
        if (!this.allowRedirectWithoutConfirm) {
            this.leaveRoom();
        }
    }

    canDeactivate(): CanDeactivateType {
        if (this.allowRedirectWithoutConfirm) {
            return true;
        } else {
            const dialogRef = this.injector.get(MatDialog).open(ConfirmDialogComponent, {
                width: '400px',
                disableClose: true,
                data: {
                    header: 'Quitter la partie',
                    content: 'Êtes-vous sûr de vouloir quitter la partie?',
                    confirmLabel: 'Oui',
                    cancelLabel: 'Non',
                },
            });

            return dialogRef.afterClosed().pipe(
                tap((result) => {
                    if (result) {
                        this.leaveRoom();
                    }
                }),
                map((result) => result),
            );
        }
    }

    getGameId() {
        return this.gameId;
    }

    toggleLock() {
        this.isLocked = !this.isLocked;
        this.injector.get(WebsocketService).handleLockState(this.gameId, this.isLocked);
    }

    startGame() {
        this.injector.get(WebsocketService).startGame(this.gameId);
    }

    addPlayer() {
        const newPlayerId = this.players.length + 1;
        const newPlayer: Player = {
            id: newPlayerId.toString(),
            name: `User ${newPlayerId}`,
        };
        this.players.push(newPlayer);
    }

    removePlayer(playerId: string) {
        this.injector.get(WebsocketService).removePlayer(this.gameId, playerId);
    }

    leaveRoom() {
        this.injector.get(WebsocketService).leaveRoom(this.gameId);
        this.injector.get(WebsocketService).reset();

        // Réinitialiser l'état de l'application
        this.resetApplicationState();
    }
    removePlayerAndRedirectHome(): void {
        const playerId = this.players.find((player) => player.name === this.playerName)?.id;
        if (playerId) {
            this.leaveRoom();
        }
        this.redirectToHome();
    }

    private resetApplicationState() {
        this.gameId = '';
        this.playerName = '';
        this.isOrganizer = false;
        this.isLocked = false;
        this.players = [];
    }

    private setupPage(): void {
        this.gameId = this.injector.get(ActivatedRoute).snapshot.paramMap.get('gameId') ?? 'defaultGameId';
        this.playerName = this.injector.get(WebsocketService).getPlayerName();
        this.isOrganizer = this.injector.get(WebsocketService).isOrganizer;

        if (this.gameId !== 'defaultGameId') {
            this.checkGameValidity();
        } else {
            this.redirectToHome();
        }
    }

    private showDialog(message: string): void {
        this.injector
            .get(MatDialog)
            .open(KickoutDialogComponent, {
                width: '250px',
                data: { reason: message },
            })
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.redirectToHome();
            });
    }

    private checkGameValidity(): void {
        this.injector
            .get(DataService)
            .validateGameId(this.gameId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => (response.body?.isValid ? this.initializeWebSocketConnection() : this.redirectToHome()),
                error: () => this.redirectToHome(),
            });
    }

    private redirectToHome(): void {
        this.injector.get(Router).navigate(['/home']);
    }

    private initializeWebSocketConnection(): void {
        this.injector.get(WebsocketService).joinRoom(this.gameId, this.playerName);
        this.handleGameStart();
        this.subscribeToPlayerEvents();
        this.handleLobbyLock();
        this.handleKickEvent();
    }

    private subscribeToPlayerEvents(): void {
        this.injector
            .get(WebsocketService)
            .onPlayerJoined()
            .pipe(takeUntil(this.destroy$))
            .subscribe((newPlayer) => this.players.push(newPlayer));
        this.injector
            .get(WebsocketService)
            .onPlayersUpdated()
            .pipe(takeUntil(this.destroy$))
            .subscribe((players) => (this.players = players));
        this.injector
            .get(WebsocketService)
            .onPlayerLeft()
            .pipe(takeUntil(this.destroy$))
            .subscribe((playerId) => this.removePlayerFromList(playerId));
    }

    private handleLobbyLock(): void {
        this.injector
            .get(WebsocketService)
            .listenForLobbyLocked()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ message }) => this.showAlertAndRedirect(message));
    }

    private handleKickEvent(): void {
        this.injector
            .get(WebsocketService)
            .listenForKick()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => this.showKickDialog(data.reason));
    }

    private handleGameStart(): void {
        this.injector
            .get(WebsocketService)
            .onStartGame()
            .pipe(takeUntil(this.destroy$))
            .subscribe((title) => {
                this.countdown = COUNTDOWN_DURATION;
                this.gameStarted = true;
                this.title = title;

                const interval = setInterval(() => {
                    this.countdown--;

                    if (this.countdown === 0) {
                        clearInterval(interval);
                        this.allowRedirectWithoutConfirm = true;
                        this.injector.get(DirectNavigationService).grantAccess();
                        this.injector.get(Router).navigate(['/game-page', this.gameId]);
                    }
                }, DURATION.OneSecMilliseconds);
            });
    }

    private removePlayerFromList(playerId: string): void {
        this.players = this.players.filter((player) => player.id !== playerId);
    }

    private showAlertAndRedirect(message: string): void {
        alert(message);
        this.redirectToHome();
    }

    private showKickDialog(reason: string): void {
        this.injector
            .get(MatDialog)
            .open(KickoutDialogComponent, {
                width: '250px',
                data: { reason: reason || 'Vous avez été expulsé de la salle.' },
            })
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.allowRedirectWithoutConfirm = true;
                this.redirectToHome();
            });
    }
}
