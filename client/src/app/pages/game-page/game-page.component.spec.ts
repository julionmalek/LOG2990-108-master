/* eslint-disable max-lines */
// Since it's a test file, we deemed a good idea to not split it in different parts.
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { FocusService } from '@app/services/focus.service/focus.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockDirectNavigationService: jasmine.SpyObj<DirectNavigationService>;
    let mockWebsocketService: jasmine.SpyObj<WebsocketService>;
    let mockFocusService: jasmine.SpyObj<FocusService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let mockSidebarService: jasmine.SpyObj<SidebarService>;
    let mockChat: jasmine.SpyObj<MatSidenav>;

    beforeEach(async () => {
        mockDirectNavigationService = jasmine.createSpyObj('DirectNavigationService', ['revokeAccess', 'grantAccess']);
        mockWebsocketService = jasmine.createSpyObj('WebsocketService', [
            'playerReady',
            'leaveRoom',
            'reset',
            'onAllPlayersReady',
            'onNextQuestion',
            'onUpdatePoints',
            'onAllPlayersAnswered',
            'listenForRoomClosure',
            'toggleSelectAnswer',
            'submitAnswers',
            'nextQuestion',
            'onHistogramDataUpdated',
            'onPlayersUpdated',
            'requestCurrentPlayers',
            'onShowResults',
        ]);
        mockFocusService = jasmine.createSpyObj('FocusService', ['isInputFocused$']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockChat = jasmine.createSpyObj('MatSidenav', ['open', 'close']);
        mockSidebarService = jasmine.createSpyObj('SidebarService', ['openChat', 'closeChat']);

        TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            providers: [
                { provide: DirectNavigationService, useValue: mockDirectNavigationService },
                { provide: WebsocketService, useValue: mockWebsocketService },
                { provide: FocusService, useValue: mockFocusService },
                { provide: Router, useValue: mockRouter },
                { provide: MatDialog, useValue: mockDialog },
                { provide: SidebarService, useValue: mockSidebarService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => {
                                    return 'ABCD';
                                },
                            },
                        },
                    },
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        mockWebsocketService.onNextQuestion.and.returnValue(
            of({
                type: 'QCM',
                text: 'Est-ce que ça marche maintenant?',
                points: 100,
                choices: [
                    {
                        text: 'Oui',
                    },
                    {
                        text: 'Non',
                    },
                    {
                        text: 'Peut-être',
                    },
                    {
                        text: 'Choix 4',
                    },
                ],
                index: 0,
                isLastQuestion: false,
                duration: 60,
            }),
        );

        const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpyObj.afterClosed.and.returnValue(of(true));

        mockDialog.open.and.returnValue(dialogRefSpyObj);
        mockWebsocketService.onHistogramDataUpdated.and.returnValue(
            of({
                questionTitle: 'test',
                choicesData: [
                    { title: 'A', count: 1, isCorrect: true },
                    { title: 'b', count: 2, isCorrect: false },
                ],
            }),
        );
        mockWebsocketService.onPlayersUpdated.and.returnValue(of([]));
        mockWebsocketService.onAllPlayersReady.and.returnValue(of(void 0));
        // This is the format we use for answerCounts
        // eslint-disable-next-line @typescript-eslint/naming-convention
        mockWebsocketService.onUpdatePoints.and.returnValue(of({ points: 10, bonus: true }));
        mockWebsocketService.onAllPlayersAnswered.and.returnValue(of([0]));
        mockWebsocketService.listenForRoomClosure.and.returnValue(of('Room closed'));
        mockWebsocketService.onShowResults.and.returnValue(
            of({
                playerList: [
                    {
                        id: 'player1',
                        name: 'Alice',
                        points: 150,
                        bonuses: 1,
                        submittedAnswerIndices: [0, 1],
                        submitTimestamp: 1588000000000,
                        ready: true,
                        isActive: true,
                    },
                    {
                        id: 'player2',
                        name: 'Bob',
                        points: 140,
                        bonuses: 2,
                        submittedAnswerIndices: [0, 1, 2],
                        ready: true,
                        isActive: false,
                    },
                ],
                histogramData: [
                    { option1: 30, option2: 25, option3: 45 },
                    { option1: 20, option2: 30, option3: 50 },
                ],
                quiz: {
                    id: 'quiz1',
                    hidden: false,
                    title: 'Sample Quiz',
                    description: 'A simple quiz to test your knowledge.',
                    duration: 60,
                    questions: [
                        {
                            id: 'q1',
                            type: 'QCM',
                            text: 'What is the capital of France?',
                            choices: [
                                { id: 'c1', text: 'Paris', isCorrect: true },
                                { id: 'c2', text: 'London', isCorrect: false },
                                { id: 'c3', text: 'Rome', isCorrect: false },
                            ],
                            points: 10,
                            lastModification: new Date('2021-04-01T10:00:00Z'),
                        },
                        {
                            id: 'q2',
                            type: 'QCM',
                            text: 'The Earth is flat.',
                            choices: [
                                { id: 'c4', text: 'True', isCorrect: false },
                                { id: 'c5', text: 'False', isCorrect: true },
                            ],
                            points: 5,
                            lastModification: new Date('2021-04-02T10:00:00Z'),
                        },
                    ],
                    lastModification: new Date('2021-04-03T10:00:00Z'),
                },
            }),
        );
        mockFocusService.isInputFocused$ = of(false);

        mockSidebarService.openChat.and.callFake(mockChat.open);
        mockSidebarService.closeChat.and.callFake(mockChat.close);

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;

        component['roomName'] = 'ABCD';

        fixture.detectChanges();
        component.state = {
            countdown: 0,
            countdownTotal: 0,
            totalPoints: 0,
            showBonus: false,
            showAnswers: false,
            transitionToNextQuestion: false,
            submittedAnswers: false,
            focusedOnInput: false,
            allowRedirectWithoutConfirm: false,
            selectedAnswerIndices: [0, 3],
            correctAnswerIndices: [],
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call revokeAccess and should initialize page property on ngOnInit', () => {
        spyOn(component, 'subscribeToEvents');
        component.ngOnInit();
        expect(mockDirectNavigationService.revokeAccess).toHaveBeenCalled();
        expect(component.subscribeToEvents).toHaveBeenCalled();
        expect(mockWebsocketService.playerReady).toHaveBeenCalledWith('ABCD');
    });

    it('should call leaveRoom on ngOnDestroy if not redirected without confirmation', () => {
        spyOn(component, 'leaveRoom');
        component.ngOnDestroy();
        expect(component.leaveRoom).toHaveBeenCalled();
    });

    it('should handle page unload', () => {
        spyOn(component, 'leaveRoom');
        const event: Event = new Event('unload');
        window.dispatchEvent(event);
        expect(component.leaveRoom).toHaveBeenCalled();
    });

    it('should handle keydown from 1 to 4', () => {
        spyOn(component, 'selectAnswer');
        const event1: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '1',
        });
        window.dispatchEvent(event1);
        expect(component.selectAnswer).toHaveBeenCalledWith(0);

        const event2: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '2',
        });
        window.dispatchEvent(event2);
        expect(component.selectAnswer).toHaveBeenCalledWith(1);

        const event3: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '3',
        });
        window.dispatchEvent(event3);
        expect(component.selectAnswer).toHaveBeenCalledWith(2);

        const event4: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '4',
        });
        window.dispatchEvent(event4);
        expect(component.selectAnswer).toHaveBeenCalledWith(3);
    });

    it('should handle keydown enter', () => {
        spyOn(component, 'submitAnswers');
        const eventEnter: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
        });
        window.dispatchEvent(eventEnter);
        expect(component.submitAnswers).toHaveBeenCalled();
    });

    it('should not respond to other keydown', () => {
        spyOn(component, 'selectAnswer');
        const event0: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '0',
        });
        window.dispatchEvent(event0);
        expect(component.selectAnswer).not.toHaveBeenCalled();

        const event5: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '5',
        });
        window.dispatchEvent(event5);
        expect(component.selectAnswer).not.toHaveBeenCalled();

        const eventESC: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'esc',
        });
        window.dispatchEvent(eventESC);
        expect(component.selectAnswer).not.toHaveBeenCalled();

        const eventC: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'c',
        });
        window.dispatchEvent(eventC);
        expect(component.selectAnswer).not.toHaveBeenCalled();
    });

    it('should not respond to keydown if input is focused', () => {
        component.state.focusedOnInput = true;
        spyOn(component, 'selectAnswer');
        const event1: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '1',
        });
        window.dispatchEvent(event1);
        expect(component.selectAnswer).not.toHaveBeenCalledWith(0);

        const event2: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '2',
        });
        window.dispatchEvent(event2);
        expect(component.selectAnswer).not.toHaveBeenCalledWith(1);

        const event3: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '3',
        });
        window.dispatchEvent(event3);
        expect(component.selectAnswer).not.toHaveBeenCalledWith(2);

        const event4: KeyboardEvent = new KeyboardEvent('keydown', {
            key: '4',
        });
        window.dispatchEvent(event4);
        expect(component.selectAnswer).not.toHaveBeenCalledWith(3);

        spyOn(component, 'submitAnswers');
        const eventEnter: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
        });
        window.dispatchEvent(eventEnter);
        expect(component.submitAnswers).not.toHaveBeenCalled();
    });

    it('leave room should do the right calls', () => {
        component.leaveRoom();
        expect(component['injector'].get(WebsocketService).leaveRoom).toHaveBeenCalledWith('ABCD');
        expect(component['injector'].get(WebsocketService).reset).toHaveBeenCalled();
    });

    it('should start countdowns and prepare for the first question', () => {
        spyOn(component, 'startCountdown');
        spyOn(component, 'prepareForNextQuestion');
        spyOn(component, 'organizerAction');
        spyOn(component, 'clearInterval');
        component.subscribeToEvents();
        expect(component.startCountdown).toHaveBeenCalled();
        expect(component.prepareForNextQuestion).toHaveBeenCalled();
        expect(component.organizerAction).toHaveBeenCalled();
        expect(component.clearInterval).toHaveBeenCalled();
    });

    it('should start countdowns and prepare for the next question', () => {
        mockWebsocketService.onNextQuestion.and.returnValue(
            of({
                type: 'QCM',
                text: 'Est-ce que ça marche maintenant?',
                points: 100,
                choices: [
                    {
                        text: 'Oui',
                    },
                    {
                        text: 'Non',
                    },
                    {
                        text: 'Peut-être',
                    },
                    {
                        text: 'Choix 4',
                    },
                ],
                index: 1,
                isLastQuestion: false,
                duration: 60,
            }),
        );
        spyOn(component, 'startCountdown');
        spyOn(component, 'prepareForNextQuestion');
        spyOn(component, 'organizerAction');
        spyOn(component, 'clearInterval');
        component.subscribeToEvents();
        expect(component.startCountdown).toHaveBeenCalled();
        expect(component.organizerAction).toHaveBeenCalled();
        expect(component.clearInterval).toHaveBeenCalled();
    });

    it('should allow redirection if states allows it', () => {
        component.state.allowRedirectWithoutConfirm = true;
        expect(component.canDeactivate()).toEqual(true);
    });

    it('should open dialog ref if states does not allow it', () => {
        component.state.allowRedirectWithoutConfirm = false;
        component.canDeactivate();
        expect(component['injector'].get(MatDialog).open).toHaveBeenCalled();
    });

    it('should be able to select an answer', () => {
        component.selectAnswer(0);
        expect(mockWebsocketService.toggleSelectAnswer).toHaveBeenCalledWith('ABCD', 0, true);
        expect(component.state.selectedAnswerIndices).toEqual([3]);
    });

    it('should be able to unselect an answer', () => {
        component.selectAnswer(1);
        expect(mockWebsocketService.toggleSelectAnswer).toHaveBeenCalledWith('ABCD', 1, false);
        expect(component.state.selectedAnswerIndices).toEqual([0, 3, 1]);
    });

    it('should be able to submit the answers if it is the player', () => {
        mockWebsocketService.isOrganizer = false;
        component.submitAnswers();
        expect(mockWebsocketService.submitAnswers).toHaveBeenCalledWith('ABCD', [0, 3]);
    });

    it('should not be able to submit the answers if it is the organizer', () => {
        mockWebsocketService.isOrganizer = true;
        component.submitAnswers();
        expect(mockWebsocketService.submitAnswers).not.toHaveBeenCalled();
    });
});
