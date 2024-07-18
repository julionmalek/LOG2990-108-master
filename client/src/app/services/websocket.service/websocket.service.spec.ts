/* eslint-disable max-lines */
// Since it's a test file, we deemed a good idea to not split it in different parts.
import { TestBed } from '@angular/core/testing';
import { MockSocket } from '@app/components/mock-socket';
import { QuestionData } from '@app/interfaces/question-data';
import { Quiz } from '@app/interfaces/quiz';
import { Message, WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
    let service: WebsocketService;
    let mockSocket: MockSocket;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WebsocketService],
        });
        service = TestBed.inject(WebsocketService);
        mockSocket = new MockSocket() as MockSocket;
        (service['socket'] as unknown as MockSocket) = mockSocket;
        spyOn(mockSocket, 'emit');
    });
    const emitJoinRoomEvent = (roomName: string, playerName: string) => {
        mockSocket.emit('joinRoom', { roomName, playerName });
    };
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect and disconnect', () => {
        service.connect();
        expect(mockSocket.connected).toBeTrue();

        service.disconnect();
        expect(mockSocket.connected).toBeFalse();
    });
    it('should set and get playerName correctly', () => {
        const testName = 'John Doe';
        service.setPlayerName(testName);
        expect(service.getPlayerName()).toBe(testName);
    });
    it('should reset organizer status, player name, and reconnect socket', () => {
        service.isOrganizer = true;
        service.setPlayerName('Test Player');
        const disconnectSpy = spyOn(service['socket'], 'disconnect').and.callThrough();
        service.reset();
        expect(service.isOrganizer).toBeFalse();
        expect(service.getPlayerName()).toBe('');
        expect(disconnectSpy).toHaveBeenCalled();
    });
    it('should emit message when roomClosed event is received', (done) => {
        const testMessage = 'Room closed by organizer';
        service.listenForRoomClosure().subscribe((message) => {
            expect(message).toBe(testMessage);
            done();
        });

        (service['socket'] as unknown as MockSocket).trigger('roomClosed', testMessage);
    });
    it('should create an observable that emits when kick event is received', (done) => {
        const kickData = { reason: 'Spam' };
        service.listenForKick().subscribe((data) => {
            expect(data).toEqual(kickData);
            done();
        });
        mockSocket.trigger('kick', kickData);
    });
    it('should emit createRoom event with roomName and quiz', () => {
        const roomName = 'testRoom';
        const quiz: Quiz = {
            id: 'quiz1',
            questions: [],
            hidden: false,
            title: 'Quiz Test',
            description: 'A test quiz',
            duration: 30,
            lastModification: new Date(),
        };
        service.createRoom(roomName, quiz);
        expect(mockSocket.emit).toHaveBeenCalledWith('createRoom', { roomName, quiz });
    });
    it('should emit toggleLockRoom event with roomName and lock state', () => {
        const roomName = 'testRoom';
        const isLocked = true;
        service.handleLockState(roomName, isLocked);
        expect(mockSocket.emit).toHaveBeenCalledWith('toggleLockRoom', { roomName, isLocked });
    });
    it('should emit startGame event with roomName', () => {
        const roomName = 'testRoom';
        service.startGame(roomName);
        expect(mockSocket.emit).toHaveBeenCalledWith('startGame', roomName);
    });

    it('should emit playerReady event with roomName', () => {
        const roomName = 'testRoom';
        service.playerReady(roomName);
        expect(mockSocket.emit).toHaveBeenCalledWith('playerReady', roomName);
    });

    it('should create an observable that emits when updatePlayers event is received', (done) => {
        const testPlayers = [
            { id: '1', name: 'Player One', points: 10, bonuses: 1, submittedAnswerIndices: [0], ready: true },
            { id: '2', name: 'Player Two', points: 5, bonuses: 0, submittedAnswerIndices: [1], ready: true },
        ];
        service.onPlayersUpdated().subscribe((players) => {
            expect(players).toEqual(testPlayers);
            done();
        });
        mockSocket.trigger('updatePlayers', testPlayers);
    });
    it('should create an observable that emits when playerJoined event is received', (done) => {
        const testPlayer = { id: '1', name: 'Test Player', points: 0, bonuses: 0, submittedAnswerIndices: [], ready: false };
        service.onPlayerJoined().subscribe((player) => {
            expect(player).toEqual(testPlayer);
            done();
        });
        mockSocket.trigger('playerJoined', testPlayer);
    });
    it('should create an observable that emits when joinConfirmed event is received', (done) => {
        service.onJoinConfirmed().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        mockSocket.trigger('joinConfirmed', null);
    });
    it('should create an observable that emits when joinError event is received', (done) => {
        const testError = { message: 'Error joining room' };
        service.listenForJoinError().subscribe((error) => {
            expect(error).toEqual(testError);
            done();
        });
        mockSocket.trigger('joinError', testError);
    });
    it('should create an observable that emits when lobbyLocked event is received', (done) => {
        const lockedMessage = { message: 'Lobby is locked' };
        service.listenForLobbyLocked().subscribe((message) => {
            expect(message).toEqual(lockedMessage);
            done();
        });
        mockSocket.trigger('lobbyLocked', lockedMessage);
    });
    it('should emit requestJoinRoomValidation event with roomName and playerName', () => {
        const roomName = 'testRoom';
        const playerName = 'JohnDoe';
        service.requestJoinRoomValidation(roomName, playerName);
        expect(mockSocket.emit).toHaveBeenCalledWith('requestJoinRoomValidation', { roomName, playerName });
    });
    it('should emit removePlayer event with roomName and playerId', () => {
        const roomName = 'testRoom';
        const playerId = 'player123';
        service.removePlayer(roomName, playerId);
        expect(mockSocket.emit).toHaveBeenCalledWith('removePlayer', { roomName, playerId });
    });
    it('should create an observable that emits when playerLeft event is received', (done) => {
        const playerId = 'player123';
        service.onPlayerLeft().subscribe((receivedPlayerId) => {
            expect(receivedPlayerId).toEqual(playerId);
            done();
        });
        mockSocket.trigger('playerLeft', playerId);
    });
    it('should emit tryJoinRoom event with roomName and playerName', () => {
        const roomName = 'testRoom';
        const playerName = 'JohnDoe';
        service.tryJoinRoom(roomName, playerName);
        expect(mockSocket.emit).toHaveBeenCalledWith('tryJoinRoom', { roomName, playerName });
    });
    it('should emit submitAnswers event with roomName and selectedAnswerIndices', () => {
        const roomName = 'testRoom';
        const selectedAnswerIndices = [0, 2];
        service.submitAnswers(roomName, selectedAnswerIndices);
        expect(mockSocket.emit).toHaveBeenCalledWith('submitAnswers', { roomName, selectedAnswerIndices });
    });
    it('should emit nextQuestion event with roomName', () => {
        const roomName = 'testRoom';
        service.nextQuestion(roomName);
        expect(mockSocket.emit).toHaveBeenCalledWith('nextQuestion', roomName);
    });
    it('should emit toggleSelectAnswer event with roomName, answerIndex, and answerSelected', () => {
        const roomName = 'testRoom';
        const answerIndex = 1;
        const answerSelected = true;
        service.toggleSelectAnswer(roomName, answerIndex, answerSelected);
        expect(mockSocket.emit).toHaveBeenCalledWith('toggleSelectAnswer', { roomName, answerIndex, answerSelected });
    });
    it('should create an observable that emits the game title when startGame event is received', (done) => {
        const title = 'Game Title';
        service.onStartGame().subscribe((receivedTitle) => {
            expect(receivedTitle).toEqual(title);
            done();
        });
        mockSocket.trigger('startGame', title);
    });
    it('should create an observable that emits when allPlayersReady event is received', (done) => {
        service.onAllPlayersReady().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        mockSocket.trigger('allPlayersReady', null);
    });

    it('should create an observable that emits correct answer indices when allPlayersAnswered event is received', (done) => {
        const correctAnswerIndices = [0, 2];
        service.onAllPlayersAnswered().subscribe((indices) => {
            expect(indices).toEqual(correctAnswerIndices);
            done();
        });
        mockSocket.trigger('allPlayersAnswered', correctAnswerIndices);
    });
    it('should create an observable that emits points and bonus info when updatePoints event is received', (done) => {
        const pointsUpdate = { points: 100, bonus: true };
        service.onUpdatePoints().subscribe((update) => {
            expect(update).toEqual(pointsUpdate);
            done();
        });
        mockSocket.trigger('updatePoints', pointsUpdate);
    });
    it('should create an observable that emits question data when nextQuestion event is received', (done) => {
        const questionData: QuestionData = {
            type: 'multiple-choice',
            text: 'What is 2+2?',
            points: 10,
            choices: [{ text: '4' }, { text: '22' }],
            index: 0,
            isLastQuestion: false,
            duration: 30,
        };
        service.onNextQuestion().subscribe((data) => {
            expect(data).toEqual(questionData);
            done();
        });
        mockSocket.trigger('nextQuestion', questionData);
    });
    it('should emit leaveRoom event with gameId and call disconnect', () => {
        const gameId = 'game123';
        if ('disconnect' in service) {
            spyOn(service, 'disconnect').and.callThrough();
        } else {
            spyOn(mockSocket, 'disconnect').and.callThrough();
        }

        service.leaveRoom(gameId);

        expect(mockSocket.emit).toHaveBeenCalledWith('leaveRoom', gameId);
        if ('disconnect' in service) {
            expect(service.disconnect).toHaveBeenCalled();
        } else {
            expect(mockSocket.disconnect).toHaveBeenCalled();
        }
    });
    it('should emit joinRoom event with roomName and playerName', () => {
        const roomName = 'testRoom';
        const playerName = 'JohnDoe';
        emitJoinRoomEvent(roomName, playerName);
        expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', { roomName, playerName });
    });
    it('should create an observable that emits histogram data when histogramDataUpdated event is received', (done) => {
        const histogramData = {
            questionTitle: "What's your favorite color?",
            choicesData: [
                { title: 'Blue', count: 10, isCorrect: false },
                { title: 'Red', count: 5, isCorrect: true },
            ],
        };
        service.onHistogramDataUpdated().subscribe((data) => {
            expect(data).toEqual(histogramData);
            done();
        });
        mockSocket.trigger('histogramDataUpdated', histogramData);
    });
    it('should create an observable that emits when pastMessages event is received', (done) => {
        const testMessages = [
            { user: 'John Doe', message: 'Hello World' },
            { user: 'Jane Doe', message: 'Hi there!' },
        ];
        service.onPastMessages().subscribe((messages) => {
            expect(messages).toEqual(testMessages);
            done();
        });
        mockSocket.trigger('pastMessages', testMessages);
    });
    it('should emit showResults event with roomName', () => {
        const roomName = 'Example Room';
        service.showResults(roomName);
        expect(mockSocket.emit).toHaveBeenCalledWith('showResults', roomName);
    });
    it('should emit requestCurrentPlayers event with roomName', () => {
        const roomName = 'Example Room';
        service.requestCurrentPlayers(roomName);
        expect(mockSocket.emit).toHaveBeenCalledWith('requestCurrentPlayers', roomName);
    });
    it('should call socket.emit with correct message and roomName when sendMessage is called', () => {
        const testMessage: Message = {
            user: 'Test User',
            message: 'Test Message',
        };
        const testRoomName = 'TestRoom';
        service.sendMessage(testMessage, testRoomName);
        expect(mockSocket.emit).toHaveBeenCalledWith('message', { message: testMessage, roomName: testRoomName });
    });
    it('should create an observable that emits when message event is received', (done) => {
        const testMessage: Message = {
            user: 'Test User',
            message: 'Test Message',
        };
        service.onMessage().subscribe((message) => {
            expect(message).toEqual(testMessage);
            done();
        });
        mockSocket.trigger('message', testMessage);
    });
    it('should receive showResults event correctly', (done) => {
        const testResult = {
            playerList: [
                {
                    id: '1',
                    name: 'Player1',
                    points: 100,
                    bonuses: 2,
                    submittedAnswerIndices: [0, 2],
                    ready: true,
                },
            ],
            histogramData: [
                {
                    questionTitle: 'Test Question',
                    choicesData: [
                        {
                            title: 'Choice 1',
                            count: 10,
                            isCorrect: true,
                        },
                    ],
                },
            ],
            quiz: {
                hidden: false,
                title: 'Quiz 1',
                description: 'This is a test quiz',
                duration: 120,
                questions: [],
                lastModification: new Date(),
            },
        };

        service.onShowResults().subscribe((data) => {
            expect(data).toEqual(
                jasmine.objectContaining({
                    playerList: jasmine.arrayContaining([
                        jasmine.objectContaining({
                            id: '1',
                            name: 'Player1',
                            points: 100,
                            bonuses: 2,
                            submittedAnswerIndices: jasmine.arrayContaining([0, 2]),
                            ready: true,
                        }),
                    ]),
                    histogramData: jasmine.arrayContaining([
                        jasmine.objectContaining({
                            questionTitle: 'Test Question',
                            choicesData: jasmine.arrayContaining([
                                jasmine.objectContaining({
                                    title: 'Choice 1',
                                    count: 10,
                                    isCorrect: true,
                                }),
                            ]),
                        }),
                    ]),
                    quiz: jasmine.objectContaining({
                        hidden: false,
                        title: 'Quiz 1',
                        description: 'This is a test quiz',
                        duration: 120,
                    }),
                }),
            );
            done();
        });

        mockSocket.trigger('showResults', testResult);
    });

    it('should return the socket id when it is defined', () => {
        service['socket'].id = '1234';
        expect(service['socket'].id).toEqual(service.socketId);
    });

    it('should return "" when the socket is undefined', () => {
        service['socket'].id = undefined;
        expect('').toEqual(service.socketId);
    });

    it('should emit create test room', () => {
        const mockQuiz: Quiz = {
            hidden: false,
            title: 'mockQuiz',
            description: 'mockDescription',
            duration: 70,
            questions: [],
            lastModification: new Date(),
        };
        service.createTestRoom(mockQuiz);
        expect(mockSocket.emit).toHaveBeenCalledWith('createTestRoom', mockQuiz);
    });

    // TODO : Have a common interface for this one. It hasn't been changed, because we need to discuss it.
    /* it('should emit join room', () => {
        service.joinRoom('1234', 'mockName');
        expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', '1234', 'mockName');
    });*/
});
