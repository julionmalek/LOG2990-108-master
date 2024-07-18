import { Component, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { KickoutDialogComponent } from '@app/components/kickout-dialog/kickout-dialog.component';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { GamePageState } from '@app/interfaces/game-page-state';
import { Player } from '@app/interfaces/player';
import { QuestionData } from '@app/interfaces/question-data';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { FocusService } from '@app/services/focus.service/focus.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { HistogramData, WebsocketService } from '@app/services/websocket.service/websocket.service';
import { GameMode } from '@common/game-mode';
import { DURATION, PERCENTAGE_MULTIPLIER, SORTING } from '@utilities/constants';
import { Subject, map, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild('chat') chatSidebar: MatSidenav;
    players: Player[] = [];
    currentQuestionData: QuestionData;
    histogramData: HistogramData;
    private intervalId: number;
    // Default gameMode is a normal quiz
    private gameMode: GameMode = GameMode.Normal;
    private roomName: string;
    private isOrganizer: boolean;
    private destroy$ = new Subject<void>();
    private gamePageState: GamePageState = {
        countdown: 0,
        countdownTotal: 0,
        totalPoints: 0,
        showBonus: false,
        showAnswers: false,
        transitionToNextQuestion: false,
        submittedAnswers: false,
        focusedOnInput: false,
        allowRedirectWithoutConfirm: false,
        selectedAnswerIndices: [],
        correctAnswerIndices: [],
    };

    constructor(private injector: Injector) {
        const navigation = this.injector.get(Router).getCurrentNavigation();
        if (navigation && navigation.extras.state) {
            this.gameMode = navigation.extras.state.mode;
        }
    }

    get progress(): number {
        return (this.state.countdown / this.state.countdownTotal) * PERCENTAGE_MULTIPLIER;
    }

    get state(): GamePageState {
        return this.gamePageState;
    }

    set state(state: GamePageState) {
        this.gamePageState = state;
    }

    @HostListener('window:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        if (this.state.focusedOnInput || this.state.submittedAnswers) {
            return;
        }

        if (event.key >= '1' && event.key <= '4') {
            const answerIndex = parseInt(event.key, 10) - 1;
            if (answerIndex >= 0 && answerIndex < this.currentQuestionData.choices.length) {
                event.preventDefault();
                this.selectAnswer(answerIndex);
                return;
            }
        }

        if (event.key === 'Enter') {
            if (!this.state.submittedAnswers) {
                event.preventDefault();
                this.submitAnswers();
            }
        }
    }

    @HostListener('window:unload', ['$event'])
    unloadHandler(): void {
        this.leaveRoom();
    }

    getIsOrganizer(): boolean {
        return this.isOrganizer;
    }

    updateHistogramData(newData: HistogramData) {
        this.histogramData = newData; // Cette variable doit maintenant être de type HistogramData
    }

    isCorrect(index: number): boolean {
        return this.state.correctAnswerIndices.includes(index);
    }

    isSelected(index: number): boolean {
        return this.state.selectedAnswerIndices.includes(index);
    }

    ngOnInit(): void {
        this.injector.get(DirectNavigationService).revokeAccess();
        this.subscribeToEvents();

        this.isOrganizer = this.injector.get(WebsocketService).isOrganizer;
        this.roomName = this.injector.get(ActivatedRoute).snapshot.paramMap.get('gameId') ?? 'defaultGameId';
        this.injector.get(WebsocketService).playerReady(this.roomName);

        if (this.gameMode !== GameMode.Testing) {
            this.injector.get(SidebarService).openChat();
            this.injector.get(WebsocketService).requestCurrentPlayers(this.roomName);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearInterval();
        this.injector.get(SidebarService).closeChat();

        if (!this.state.allowRedirectWithoutConfirm) {
            this.leaveRoom();
        }
    }

    leaveRoom() {
        this.injector.get(WebsocketService).leaveRoom(this.roomName);
        this.injector.get(WebsocketService).reset();
    }

    subscribeToEvents(): void {
        this.injector
            .get(WebsocketService)
            .onAllPlayersReady()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.organizerAction();
            });

        this.injector
            .get(WebsocketService)
            .onHistogramDataUpdated()
            .pipe(takeUntil(this.destroy$))
            .subscribe((histogramData: HistogramData) => {
                this.updateHistogramData(histogramData);
            });

        this.injector
            .get(WebsocketService)
            .onNextQuestion()
            .pipe(takeUntil(this.destroy$))
            .subscribe((questionData: QuestionData) => {
                this.state.transitionToNextQuestion = true;

                // No countdown on first question
                if (questionData.index === 0) {
                    this.currentQuestionData = questionData;
                    this.prepareForNextQuestion();
                    this.startCountdown(questionData.duration, () => {
                        this.submitAnswers();
                    });
                } else {
                    this.startCountdown(questionData.index === 0 ? 0 : DURATION.ThreeSec, () => {
                        this.currentQuestionData = questionData;
                        this.prepareForNextQuestion();
                        this.startCountdown(questionData.duration, () => {
                            this.submitAnswers();
                        });
                    });
                }
            });

        this.injector
            .get(WebsocketService)
            .onPlayersUpdated()
            .pipe(takeUntil(this.destroy$))
            .subscribe((players) => {
                this.players = players;
            });

        this.injector
            .get(WebsocketService)
            .onUpdatePoints()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ points, bonus }) => {
                this.state.totalPoints = points;
                this.state.showBonus = bonus;
            });

        this.injector
            .get(WebsocketService)
            .onAllPlayersAnswered()
            .pipe(takeUntil(this.destroy$))
            .subscribe((correctAnswerIndices: number[]) => {
                this.state.correctAnswerIndices = correctAnswerIndices;
                this.state.showAnswers = true;
                this.clearInterval();
                this.state.countdown = 0;

                if (this.gameMode === GameMode.Testing) {
                    if (this.currentQuestionData.isLastQuestion) {
                        this.startCountdown(DURATION.ThreeSec, () => {
                            this.state.allowRedirectWithoutConfirm = true;
                            this.injector.get(Router).navigate(['/select-game']);
                            this.leaveRoom();
                        });
                    } else {
                        this.injector.get(WebsocketService).nextQuestion(this.roomName);
                    }
                }
            });

        this.injector
            .get(WebsocketService)
            .onShowResults()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ playerList, histogramData, quiz }) => {
                this.state.allowRedirectWithoutConfirm = true;
                this.injector.get(DirectNavigationService).grantAccess();
                this.injector.get(Router).navigate(['/results-page', this.roomName], { state: { playerList, histogramData, quiz } });
            });

        this.injector
            .get(WebsocketService)
            .listenForRoomClosure()
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                this.clearInterval();
                this.showDialog(message);
            });

        this.injector
            .get(FocusService)
            .isInputFocused$.pipe(takeUntil(this.destroy$))
            .subscribe((isFocused) => {
                this.state.focusedOnInput = isFocused;
            });
    }

    organizerAction(): void {
        if (this.currentQuestionData && this.currentQuestionData.isLastQuestion && !this.gamePageState.transitionToNextQuestion) {
            this.injector.get(WebsocketService).showResults(this.roomName);
        } else {
            this.injector.get(WebsocketService).nextQuestion(this.roomName);
        }
    }

    prepareForNextQuestion(): void {
        this.state.showAnswers = false;
        this.state.showBonus = false;
        this.state.submittedAnswers = false;
        this.state.transitionToNextQuestion = false;
        this.state.correctAnswerIndices = [];
        this.state.selectedAnswerIndices = [];
    }

    canDeactivate(): CanDeactivateType {
        if (this.state.allowRedirectWithoutConfirm) {
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

    clearInterval(): void {
        clearInterval(this.intervalId);
    }

    startCountdown(countdownLength: number, callback: () => void): void {
        this.state.countdownTotal = countdownLength;
        this.state.countdown = countdownLength;
        this.intervalId = window.setInterval(() => {
            this.state.countdown--;
            if (this.state.countdown === 0) {
                this.clearInterval();
                callback();
            }
        }, DURATION.OneSecMilliseconds);
    }

    selectAnswer(answerIndex: number): void {
        const indexInArray = this.state.selectedAnswerIndices.indexOf(answerIndex);
        if (indexInArray > SORTING.FirstIsLess) {
            this.state.selectedAnswerIndices.splice(indexInArray, 1);
            this.injector.get(WebsocketService).toggleSelectAnswer(this.roomName, answerIndex, true);
        } else {
            this.state.selectedAnswerIndices.push(answerIndex);
            this.injector.get(WebsocketService).toggleSelectAnswer(this.roomName, answerIndex, false);
        }
    }

    submitAnswers(): void {
        if (!this.injector.get(WebsocketService).isOrganizer) {
            this.state.submittedAnswers = true;
            this.injector.get(WebsocketService).submitAnswers(this.roomName, this.state.selectedAnswerIndices);
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
                this.state.allowRedirectWithoutConfirm = true;
                this.injector.get(Router).navigate(['/joindre-partie']);
            });
    }
}
