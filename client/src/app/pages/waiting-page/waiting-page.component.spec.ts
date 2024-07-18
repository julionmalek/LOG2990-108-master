/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// We need to disable magic numbers here because it's a test file
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { KickoutDialogComponent } from '@app/components/kickout-dialog/kickout-dialog.component';
import { Player } from '@app/interfaces/player';
import { DataService } from '@app/services/data.service/data.service';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { RoomService } from '@app/services/room.service/room.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { of, throwError } from 'rxjs';
import { WaitingPageComponent } from './waiting-page.component';

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;
    let dataServiceMock: jasmine.SpyObj<DataService>;
    let websocketServiceMock: jasmine.SpyObj<WebsocketService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;
    let matDialogRefMock: jasmine.SpyObj<MatDialogRef<unknown, unknown>>;
    let directNavigationServiceMock: jasmine.SpyObj<DirectNavigationService>;
    let sidebarServiceMock: jasmine.SpyObj<SidebarService>;
    let roomServiceMock: jasmine.SpyObj<RoomService>;

    class RouterMock {
        navigate = jasmine.createSpy('navigate');
        navigateByUrl = jasmine.createSpy('navigateByUrl');
        events = of(new NavigationStart(0, 'http://localhost:4200/home'));
    }

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(of(null));
        directNavigationServiceMock = jasmine.createSpyObj('DirectNavigationService', ['grantAccess', 'revokeAccess']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        sidebarServiceMock = jasmine.createSpyObj('SidebarService', ['openChat', 'closeChat']);
        activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: {
                paramMap: jasmine.createSpyObj('ParamMap', { get: 'testGameId' }),
            },
        });

        dataServiceMock = jasmine.createSpyObj('DataService', ['validateGameId']);
        websocketServiceMock = jasmine.createSpyObj('WebsocketService', [
            'leaveRoom',
            'reset',
            'listenForRoomClosure',
            'sendMessage',
            'handleLockState',
            'removePlayer',
            'removePlayerWithoutBanningName',
            'getPlayerName',
            'joinRoom',
            'onPlayerJoined',
            'onPlayersUpdated',
            'onPlayerLeft',
            'listenForLobbyLocked',
            'listenForKick',
            'onStartGame',
            'startGame',
        ]);
        roomServiceMock = jasmine.createSpyObj('RoomService', ['setIsOrganizer', 'setRoomId']);

        websocketServiceMock.startGame.and.callThrough();
        websocketServiceMock.getPlayerName.and.returnValue('testPlayerName');
        websocketServiceMock.joinRoom.and.callThrough();
        websocketServiceMock.listenForRoomClosure.and.returnValue(of(''));
        websocketServiceMock.onPlayerJoined.and.returnValue(
            of({
                id: '1',
                name: 'Test Player',
                isOrganizer: false,
                points: 50,
                bonuses: 10,
                submittedAnswerIndices: [0, 1],
                ready: true,
            }),
        );
        websocketServiceMock.onStartGame.and.returnValue(of('Test Title'));
        websocketServiceMock.onPlayersUpdated.and.returnValue(of([]));
        websocketServiceMock.onPlayerLeft.and.returnValue(of(''));
        websocketServiceMock.listenForLobbyLocked.and.returnValue(of({ message: '' }));
        websocketServiceMock.listenForKick.and.returnValue(of({ reason: '' }));
        websocketServiceMock.onPlayerJoined.and.returnValue(
            of({
                id: '1',
                name: 'Test Player',
                isOrganizer: false,
                points: 50,
                bonuses: 10,
                submittedAnswerIndices: [0, 1],
                ready: true,
            }),
        );

        await TestBed.configureTestingModule({
            declarations: [WaitingPageComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [
                { provide: DataService, useValue: dataServiceMock },
                { provide: WebsocketService, useValue: websocketServiceMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                { provide: Router, useClass: RouterMock },
                { provide: DirectNavigationService, useValue: directNavigationServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: SidebarService, useValue: sidebarServiceMock },
                { provide: RoomService, useValue: roomServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        component.ngOnDestroy();
        TestBed.resetTestingModule();
    });

    describe('unLoadHandler', () => {
        it('should call leaveRoom when unloadHandler is called', () => {
            const leaveRoomSpy = spyOn(component, 'leaveRoom');
            component.unloadHandler();
            expect(leaveRoomSpy).toHaveBeenCalled();
        });
    });

    describe('getCountdown', () => {
        it('should return countdown when getCountdown is called', () => {
            component['countdown'] = 5;
            expect(component.getCountdown()).toEqual(5);
        });
    });

    describe('getTitle', () => {
        it('should return title when getTitle is called', () => {
            component['title'] = 'Test Title';
            expect(component.getTitle()).toEqual('Test Title');
        });
    });

    describe('getGameStarted', () => {
        it('should return gameStarted when getGameStarted is called', () => {
            component['gameStarted'] = true;
            expect(component.getGameStarted()).toBeTrue();
        });
    });

    describe('ngOnInit', () => {
        it('should setup the element on initialization', () => {
            spyOn(component, 'setupPage' as never);
            spyOn(component, 'showDialog' as never);
            component.ngOnInit();
            expect(component['setupPage']).toHaveBeenCalled();
            expect(directNavigationServiceMock.revokeAccess).toHaveBeenCalled();
            expect(roomServiceMock.setRoomId).toHaveBeenCalledWith(component.gameId);
            expect(roomServiceMock.setIsOrganizer).toHaveBeenCalledWith(component.isOrganizer);
            expect(sidebarServiceMock.openChat).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe on destroy and not leave room', () => {
            spyOn(component['destroy$'], 'next');
            spyOn(component['destroy$'], 'complete');
            spyOn(component, 'leaveRoom');
            component['allowRedirectWithoutConfirm'] = true;
            component.ngOnDestroy();
            expect(component['destroy$'].next).toHaveBeenCalled();
            expect(component['destroy$'].complete).toHaveBeenCalled();
            expect(sidebarServiceMock.closeChat).toHaveBeenCalled();
            expect(component.leaveRoom).not.toHaveBeenCalled();
        });

        it('should unsubscribe on destroy and leave room', () => {
            spyOn(component['destroy$'], 'next');
            spyOn(component['destroy$'], 'complete');
            spyOn(component, 'leaveRoom');
            component['allowRedirectWithoutConfirm'] = false;
            component.ngOnDestroy();
            expect(component['destroy$'].next).toHaveBeenCalled();
            expect(component['destroy$'].complete).toHaveBeenCalled();
            expect(sidebarServiceMock.closeChat).toHaveBeenCalled();
            expect(component.leaveRoom).toHaveBeenCalled();
        });
    });

    describe('canDeactivate', () => {
        it('should return true if allowRedirectWithoutConfirm is true', () => {
            component['allowRedirectWithoutConfirm'] = true;
            expect(component.canDeactivate()).toBeTrue();
        });

        it('should not call leaveRoom when canDeactivate is called and dialog is not confirmed', () => {
            const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefMock.afterClosed.and.returnValue(of(false));
            matDialogMock.open.and.returnValue(dialogRefMock);
            const leaveRoomSpy = spyOn(component, 'leaveRoom');
            const canDeactivateResult = component.canDeactivate();
            if (typeof canDeactivateResult === 'boolean') {
                expect(canDeactivateResult).toBeFalse();
            } else {
                canDeactivateResult.subscribe((result) => {
                    expect(result).toBeFalse();
                });
            }

            expect(matDialogMock.open).toHaveBeenCalled();
            expect(leaveRoomSpy).not.toHaveBeenCalled();
        });

        it('should call leaveRoom when canDeactivate is called and dialog is confirmed', () => {
            const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefMock.afterClosed.and.returnValue(of(true));
            matDialogMock.open.and.returnValue(dialogRefMock);
            const leaveRoomSpy = spyOn(component, 'leaveRoom');
            const canDeactivateResult = component.canDeactivate();
            if (typeof canDeactivateResult === 'boolean') {
                expect(canDeactivateResult).toBeTrue();
            } else {
                canDeactivateResult.subscribe((result) => {
                    expect(result).toBeTrue();
                });
            }

            expect(matDialogMock.open).toHaveBeenCalled();
            expect(leaveRoomSpy).toHaveBeenCalled();
        });
    });

    describe('getGameId', () => {
        it('should return gameId when called', () => {
            component.gameId = 'gameIdTest';
            expect(component.getGameId()).toEqual('gameIdTest');
        });
    });

    describe('toggleLock', () => {
        it('should toggle isLocked when toggleLock is called', () => {
            component.isLocked = false;
            component.toggleLock();
            expect(component.isLocked).toBeTrue();
        });
    });

    describe('startGame', () => {
        it('should startGame on WebsocketService when called', () => {
            component.startGame();
            expect(websocketServiceMock.startGame).toHaveBeenCalledWith(component.gameId);
        });
    });

    describe('addPlayer', () => {
        it('should add player when called', () => {
            component.players = [];
            component.addPlayer();
            expect(component.players.length).toBe(1);
            expect(component.players[0]).toEqual({ id: '1', name: 'User 1' });
        });
    });

    describe('removePlayer', () => {
        it('should remove player when  called', () => {
            component.removePlayer('1');
            expect(websocketServiceMock.removePlayer).toHaveBeenCalledWith(component.gameId, '1');
        });
    });

    describe('leaveRoom', () => {
        it('should call leaveRoom and reset when leaveRoom is called', () => {
            spyOn(component, 'resetApplicationState' as never);
            component.leaveRoom();
            expect(websocketServiceMock.leaveRoom).toHaveBeenCalledWith(component.gameId);
            expect(websocketServiceMock.reset).toHaveBeenCalled();
            expect(component['resetApplicationState']).toHaveBeenCalled();
        });
    });

    describe('removePlayerAndRedirectHome', () => {
        beforeEach(() => {
            component.players = [{ id: '1', name: 'Existing Player' }];
            component.gameId = 'gameIdTest';
            spyOn(component, 'leaveRoom' as never);
            spyOn(component, 'redirectToHome' as never);
        });
        it('should call leaveRoom and redirect to home when a player is found', () => {
            component.playerName = 'Existing Player';
            component.removePlayerAndRedirectHome();
            expect(component['redirectToHome']).toHaveBeenCalled();
            expect(component.leaveRoom).toHaveBeenCalled();
        });

        it('should not call leaveRoom and redirect to home when no players are found', () => {
            component.playerName = 'Non-Existing Player';
            component.removePlayerAndRedirectHome();
            expect(component['redirectToHome']).toHaveBeenCalled();
            expect(component.leaveRoom).not.toHaveBeenCalled();
        });
    });

    describe('resetApplicationState', () => {
        it('should reset application state', () => {
            component.gameId = 'mock-game-id';
            component.playerName = 'mock-player-name';
            component.isOrganizer = true;
            component.isLocked = true;
            component.players = [{ id: '1', name: 'Existing Player' }];
            component['resetApplicationState']();
            expect(component.gameId).toEqual('');
            expect(component.playerName).toEqual('');
            expect(component.isOrganizer).toEqual(false);
            expect(component.isLocked).toEqual(false);
            expect(component.players).toEqual([]);
        });
    });

    describe('setUpPage', () => {
        it('should handle a game ID', () => {
            spyOn(component, 'checkGameValidity' as never);
            spyOn(component, 'redirectToHome' as never);
            component['setupPage']();
            expect(component['redirectToHome']).not.toHaveBeenCalled();
            expect(component['checkGameValidity']).toHaveBeenCalled();
        });
        it('should handle default Game ID', () => {
            component['injector'].get(ActivatedRoute).snapshot.paramMap.get = () => null;
            spyOn(component, 'checkGameValidity' as never);
            spyOn(component, 'redirectToHome' as never);
            component['setupPage']();
            expect(component['redirectToHome']).toHaveBeenCalled();
            expect(component['checkGameValidity']).not.toHaveBeenCalled();
        });
    });

    describe('showDialog', () => {
        it('should redirect to home ', () => {
            spyOn(component, 'redirectToHome' as never);
            component['showDialog']('mock-message');
            expect(matDialogMock.open).toHaveBeenCalledWith(KickoutDialogComponent, {
                width: '250px',
                data: { reason: 'mock-message' },
            });
            expect(component['redirectToHome']).toHaveBeenCalled();
        });
    });

    describe('checkGameValidity', () => {
        beforeEach(() => {
            spyOn(component, 'initializeWebSocketConnection' as never);
            spyOn(component, 'redirectToHome' as never);
        });
        it('should return game validity if valid', () => {
            dataServiceMock.validateGameId.and.returnValue(of(new HttpResponse({ body: { isValid: true } })));
            component['checkGameValidity']();
            expect(component['initializeWebSocketConnection']).toHaveBeenCalled();
            expect(component['redirectToHome']).not.toHaveBeenCalled();
        });
        it('should return game validity if not valid', () => {
            dataServiceMock.validateGameId.and.returnValue(of(new HttpResponse({ body: { isValid: false } })));
            component['checkGameValidity']();
            expect(component['initializeWebSocketConnection']).not.toHaveBeenCalled();
            expect(component['redirectToHome']).toHaveBeenCalled();
        });
        it('should handle error', () => {
            const errorResponse = new HttpErrorResponse({
                error: 'Error deleting quiz',
                status: 500,
                statusText: 'Internal Server Error',
            });
            dataServiceMock.validateGameId.and.returnValue(throwError(() => errorResponse));
            component['checkGameValidity']();
            expect(component['initializeWebSocketConnection']).not.toHaveBeenCalled();
            expect(component['redirectToHome']).toHaveBeenCalled();
        });
    });

    describe('redirectToHome', () => {
        it('should redirect to home', () => {
            component['redirectToHome']();
            expect(component['injector'].get(Router).navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('initializeWebSocketConnection', () => {
        it('should initialize the websocket connections', () => {
            spyOn(component, 'handleGameStart' as never);
            spyOn(component, 'subscribeToPlayerEvents' as never);
            spyOn(component, 'handleLobbyLock' as never);
            spyOn(component, 'handleKickEvent' as never);

            component['initializeWebSocketConnection']();

            expect(websocketServiceMock.joinRoom).toHaveBeenCalledWith(component.gameId, component.playerName);
            expect(component['handleGameStart']).toHaveBeenCalled();
            expect(component['subscribeToPlayerEvents']).toHaveBeenCalled();
            expect(component['handleLobbyLock']).toHaveBeenCalled();
            expect(component['handleKickEvent']).toHaveBeenCalled();
        });
    });

    describe('subscribeToPlayerEvents', () => {
        it('should subscribe to listenForPlayerJoined and listenForPlayerLeft', () => {
            websocketServiceMock.onPlayerJoined.and.returnValue(of({ id: 'Player 1' } as Player));
            websocketServiceMock.onPlayersUpdated.and.returnValue(of([{ id: 'Player 2' }, { id: 'Player 3' }, { id: 'Player 4' }] as Player[]));
            websocketServiceMock.onPlayerLeft.and.returnValue(of('Player 5'));
            spyOn(component, 'removePlayerFromList' as never);

            component['subscribeToPlayerEvents']();

            expect(websocketServiceMock.onPlayerJoined).toHaveBeenCalled();
            expect(websocketServiceMock.onPlayersUpdated).toHaveBeenCalled();
            expect(websocketServiceMock.onPlayerLeft).toHaveBeenCalled();

            expect(component['removePlayerFromList']).toHaveBeenCalledWith('Player 5');
        });
    });

    describe('handleLobbyLock', () => {
        it('should subscribe to listenForLobbyLocked and call showAlertAndRedirect with the received message', () => {
            websocketServiceMock.listenForLobbyLocked.and.returnValue(of({ message: 'Test reason' }));
            spyOn(component, 'showAlertAndRedirect' as never);
            component['handleLobbyLock']();
            expect(websocketServiceMock.listenForLobbyLocked).toHaveBeenCalled();
            expect(component['showAlertAndRedirect']).toHaveBeenCalledWith('Test reason');
        });
    });

    describe('handleKickEvent', () => {
        it('should send kick message and reason', () => {
            websocketServiceMock.listenForKick.and.returnValue(of({ reason: 'Test reason' }));
            spyOn(component, 'showKickDialog' as never);
            component['handleKickEvent']();

            expect(websocketServiceMock.listenForKick).toHaveBeenCalled();
            expect(component['showKickDialog']).toHaveBeenCalledWith('Test reason');
        });
    });

    describe('handleGameStart', () => {
        it('should decrease countdown and navigate to game page when countdown reaches zero', fakeAsync(() => {
            const router = TestBed.inject(Router);
            const directNavigationService = TestBed.inject(DirectNavigationService);
            const navigateSpy = router.navigate;
            component['handleGameStart']();
            tick(5000);

            expect(component.getCountdown()).toBe(0);
            expect(navigateSpy).toHaveBeenCalledWith(['/game-page', component.gameId]);
            expect(directNavigationService.grantAccess).toHaveBeenCalled();
        }));
    });

    describe('removePlayerFromList', () => {
        beforeEach(() => {
            component.players = [
                { id: '1', name: 'Player 1' },
                { id: '2', name: 'Player 2' },
                { id: '3', name: 'Player 3' },
                { id: '4', name: 'Player 4' },
            ];
        });
        it('should remove player from list if it exists', () => {
            component['removePlayerFromList']('2');
            expect(component.players.length).toEqual(3);
            expect(component.players).toEqual([
                { id: '1', name: 'Player 1' },
                { id: '3', name: 'Player 3' },
                { id: '4', name: 'Player 4' },
            ]);
        });

        it('should return the same array if the player does not exist', () => {
            component['removePlayerFromList']('5');
            expect(component.players).toEqual([
                { id: '1', name: 'Player 1' },
                { id: '2', name: 'Player 2' },
                { id: '3', name: 'Player 3' },
                { id: '4', name: 'Player 4' },
            ]);
        });
    });

    describe('showAlertAndRedirect', () => {
        it('should show alert and redirect', () => {
            const alertSpy = spyOn(window, 'alert');
            spyOn(component, 'redirectToHome' as never);

            component['showAlertAndRedirect']('Test message');

            expect(alertSpy).toHaveBeenCalledWith('Test message');
            expect(component['redirectToHome']).toHaveBeenCalled();
        });
    });
    describe('showKickDialog', () => {
        it('should send a message after being kicked', () => {
            spyOn(component, 'redirectToHome' as never);
            component['showKickDialog']('mock-reason');
            expect(matDialogMock.open).toHaveBeenCalledWith(KickoutDialogComponent, {
                width: '250px',
                data: { reason: 'mock-reason' },
            });
            expect(component['allowRedirectWithoutConfirm']).toBe(true);
            expect(component['redirectToHome']).toHaveBeenCalled();
        });

        it('should send a message after being kicked without reason', () => {
            spyOn(component, 'redirectToHome' as never);
            component['showKickDialog']('');
            expect(matDialogMock.open).toHaveBeenCalledWith(KickoutDialogComponent, {
                width: '250px',
                data: { reason: 'Vous avez été expulsé de la salle.' },
            });
            expect(component['allowRedirectWithoutConfirm']).toBe(true);
            expect(component['redirectToHome']).toHaveBeenCalled();
        });
    });
});
