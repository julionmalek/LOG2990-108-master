// We deemed a good idea to not split it in different parts.
/* eslint-disable max-lines */

// on laisse les consol log pour linstant pour le debug
/* eslint-disable no-console */

// These magic numbers are used for tests.
/* eslint-disable @typescript-eslint/no-magic-numbers */
// on utilise expect(x).to.exist; pour vérifier les conditions. Cette exression est essentielle pour tester de manière expressive avec Chai.
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from 'app/server';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Socket, io as ioClient } from 'socket.io-client';
import { Container } from 'typedi';
interface Question {
    type: string;
    text: string;
    choices: { text: string; isCorrect: boolean; _id: string; id: string }[];
    points: number;
    _id: string;
    lastModification: string;
}
interface Quiz {
    id?: string;
    hidden: boolean;
    title: string;
    description: string;
    duration: number;
    questions: Question[];
    lastModification: Date;
}

interface Player {
    id: string;
    name: string;
    points: number;
    bonuses: number;
    submittedAnswerIndices: number[];
    submitTimestamp?: number;
    ready: boolean;
}

const urlString = 'http://localhost:3000';

describe('SocketManager service tests', () => {
    let server: Server;
    let organizerSocket: Socket;
    let clientSocket: Socket;

    beforeEach(async () => {
        sinon.restore();
        server = Container.get(Server);
        server.init();
        clientSocket = ioClient(urlString);
        organizerSocket = ioClient(urlString);
        clientSocket.connect();
        organizerSocket.connect();
    });

    afterEach(() => {
        clientSocket.close();
        organizerSocket.close();
        server.getSocketManager().getIOServer().close();
        sinon.restore();
        if (organizerSocket.connected) {
            console.log('organizer disconnecting...');
        } else {
            console.log('no connection to break organizer ...');
        }
        if (clientSocket.connected) {
            console.log('disconnecting...');
            clientSocket.disconnect();
        } else {
            console.log('no connection to break client ...');
        }
    });

    it('should create a room', (done) => {
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        clientSocket.once('roomCreated', (room) => {
            expect(room).to.exist;
            expect(room.name).to.equal(roomName);
            expect(room.quiz.title).to.equal(quiz.title);
            done();
        });

        clientSocket.emit('createRoom', { roomName, quiz });

        clientSocket.on('error', (error) => {
            done(error);
        });
    });

    it('should create a test room', (done) => {
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        clientSocket.once('testRoomCreated', (room) => {
            expect(room).to.exist;
            expect(room.name).to.equal(clientSocket.id);
            expect(room.quiz.title).to.equal(quiz.title);
            done();
        });

        clientSocket.emit('createTestRoom', quiz);

        clientSocket.on('error', (error) => {
            done(error);
        });
    });

    it('should not create a test room if the room  already exists', (done) => {
        const quiz: Quiz = {
            title: 'Duplicate Room Quiz',
            description: 'Trying to create a room with an existing name.',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createTestRoom', quiz);

        organizerSocket.once('testRoomCreated', () => {
            organizerSocket.emit('createTestRoom', quiz);
            organizerSocket.once('testRoomCreationError', (message) => {
                expect(message).to.exist;
                done();
            });
        });
    });

    it('should not create a room if the room name already exists', (done) => {
        const roomName = 'ExistingRoom';
        const quiz: Quiz = {
            title: 'Duplicate Room Quiz',
            description: 'Trying to create a room with an existing name.',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', () => {
            organizerSocket.emit('createRoom', { roomName, quiz });
            organizerSocket.once('roomCreationError', (message) => {
                expect(message).to.exist;
                done();
            });
        });
    });

    it('should remove a player', (done) => {
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };
        const playerName = 'Player to be Removed';

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, playerName);

            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('removePlayer', { playerId: clientSocket.id, roomName });

                clientSocket.once('kick', (reason) => {
                    expect(reason.reason).to.equal('Vous avez été retiré du jeu.');
                    done();
                });
            });
        });

        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should handle remove a player error when player doesnt exist', (done) => {
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };
        const playerName = 'Player to be Removed';

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, playerName);

            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('removePlayer', { playerId: 123, roomName });

                organizerSocket.once('removePlayerDoesntExist', (error) => {
                    expect(error.message).to.equal("Le joueur n'existe pas.");
                    done();
                });
            });
        });

        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should allow locking and unlocking a room', (done) => {
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };
        const playerName = 'Some Player';

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            organizerSocket.emit('toggleLockRoom', { roomName, isLocked: true });
            clientSocket.emit('requestJoinRoomValidation', { roomName, playerName });
            clientSocket.once('joinError', (error) => {
                expect(error).to.exist;
                expect(error.message).to.include('Cette salle est actuellement verrouil');

                organizerSocket.emit('toggleLockRoom', { roomName, isLocked: false });
                clientSocket.emit('joinRoom', roomName, 'Some Player');
                done();
            });
        });

        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should not allow joining a non-existent room', (done) => {
        const roomName = 'NonExistentRoom';
        const playerName = 'TestPlayer';

        clientSocket.emit('requestJoinRoomValidation', { roomName, playerName });

        clientSocket.once('joinError', (error) => {
            expect(error.message).to.include("Cette salle n'existe pas");
            done();
        });
        clientSocket.on('error', (error) => done(new Error(`Unexpected error occurred: ${error.message}`)));
    });

    it('should prevent joining a locked room', (done) => {
        const roomName = 'LockedRoomTest';
        const playerName = 'Player1';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            organizerSocket.emit('toggleLockRoom', { roomName, isLocked: true });

            clientSocket.emit('requestJoinRoomValidation', { roomName, playerName });
            clientSocket.once('joinError', (error) => {
                expect(error).to.exist;
                expect(error.message).to.include('Cette salle est actuellement verrouillée');
                done();
            });
        });
    });

    it('should prevent joining a non existent room', (done) => {
        const roomName = 'LockedRoomTest';
        const playerName = 'Player1';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            organizerSocket.emit('toggleLockRoom', { roomName, isLocked: true });

            clientSocket.emit('joinRoom', { roomName, playerName });
            clientSocket.once('joinErrorJoinRoom', (error) => {
                console.log(error);
                expect(error).to.exist;
                expect(error.message).to.include("Cette salle n'existe pas");
                done();
            });
        });
    });

    it('should prevent joining a room as an organizer of that room', (done) => {
        const roomName = 'organizerRoomTest';
        const organisateur = 'Organisateur';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            console.log(organizerSocket.id);
            organizerSocket.emit('joinRoom', roomName, organisateur);
            organizerSocket.once('joinErrorJoinRoom', (error) => {
                console.log(error);
                expect(error).to.exist;
                expect(error.message).to.include('Vous êtes déjà dans cette salle.');
                done();
            });
        });
    });

    it('should not allow joining with a name that is already in use or banned', (done) => {
        const playerName = 'ExistingPlayer';
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, playerName);

            clientSocket.once('joinRoomSuccess', () => {
                clientSocket.emit('requestJoinRoomValidation', { roomName, playerName });

                clientSocket.once('joinError', (error) => {
                    expect(error.message).to.include('Ce nom est déjà utilisé ou interdit.');
                    done();
                });

                clientSocket.on('error', (error) => done(new Error(`Unexpected error occurred: ${error.message}`)));
            });
        });
    });

    it('should allow a player to join a room', (done) => {
        const playerName = 'ExistingPlayer';
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('requestJoinRoomValidation', { roomName, playerName });
            clientSocket.once('joinConfirmed', (message) => {
                expect(message.message).to.include('Join confirmed');
                done();
            });

            clientSocket.on('error', (error) => done(new Error(`Unexpected error occurred: ${error.message}`)));
        });
    });

    it('should start a game correctly', (done) => {
        const roomName = 'ABCD';
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            organizerSocket.emit('startGame', roomName);
            organizerSocket.once('startGame', (quizTitle) => {
                expect(quizTitle).to.equal(quiz.title);
                done();
            });
        });

        clientSocket.on('error', (error) => done(error));
    });

    it('should return an empty array when no game rooms exist', () => {
        expect(server.getSocketManager().getGameRooms()).to.be.an('array').that.is.empty;
    });

    it('should correctly handle a player leaving a room', (done) => {
        const roomName = 'TestRoomForLeaving';
        const quiz: Quiz = {
            title: 'Test Quiz for Leave',
            description: 'A quiz to test leave functionality.',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', (room) => {
            expect(room.name).to.equal(roomName);
            clientSocket.emit('joinRoom', roomName, 'TestPlayer');

            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('startGame', roomName);
                organizerSocket.once('startGame', (quizTitle) => {
                    expect(quizTitle).to.equal(quiz.title);
                    clientSocket.emit('leaveRoom', roomName);

                    clientSocket.once('leftRoom', (players) => {
                        expect(players).to.be.an('array').that.is.empty;
                        clientSocket.once('roomClosedTest', (message) => {
                            expect(message).to.include('La partie est terminée parce que tous les joueurs ont quitté.');
                            done();
                        });
                    });
                });
            });
        });
        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should close the room when the organizer leaves', (done) => {
        const roomName = 'OrganizerLeaveTestRoom';
        const quiz: Quiz = {
            title: 'Organizer Leave Test',
            description: 'Testing organizer leaving the room.',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', (room) => {
            expect(room.name).to.equal(roomName);

            clientSocket.emit('joinRoom', roomName, 'TestPlayer');
            clientSocket.once('joinRoomSuccess', () => {
                // Ensure the client successfully joined before proceeding
            });
            organizerSocket.emit('leaveRoom', roomName);
            organizerSocket.once('roomClosedTest', (message) => {
                expect(message).to.include("La partie est terminée parce que l'organisateur a quitté.");
                done();
            });
        });
        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should allow sending and receiving messages within a room', (done) => {
        const roomName = 'TestMessageRoom';
        const testMessage = {
            user: 'TestUser',
            message: 'Hello, World!',
        };
        const quiz: Quiz = {
            title: 'Organizer Leave Test',
            description: 'Testing organizer leaving the room.',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', (room) => {
            expect(room.name).to.equal(roomName);

            clientSocket.emit('joinRoom', roomName, 'TestUser');
            clientSocket.once('joinRoomSuccess', () => {
                clientSocket.emit('message', { roomName, message: testMessage });

                clientSocket.once('messageSent', (receivedMessage) => {
                    expect(receivedMessage).to.include(testMessage);
                    expect(receivedMessage).to.have.property('timestamp');
                    done();
                });
            });
        });

        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should allow sending a message in a room and create message list if not exists', (done) => {
        const roomName = 'MessageTestRoom';
        const message = { user: 'Player1', message: 'Hello, World!' };
        const quiz: Quiz = {
            title: 'Test Quiz',
            description: 'Quiz Description',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });
        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('message', { roomName, message });
            clientSocket.once('messageSent', (receivedMessage) => {
                expect(receivedMessage).to.deep.include(message);
                done();
            });
        });
    });

    it('should emit allPlayersReady when all players are marked as ready', (done) => {
        const roomName = 'ReadyRoomTest';
        const quiz: Quiz = {
            title: 'Ready Test Quiz',
            description: 'A Quiz for ready test',
            duration: 30,
            hidden: false,
            questions: [],
            lastModification: new Date(),
        };

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName);

            let client1Joined = false;
            const checkClientJoined = () => {
                if (client1Joined) {
                    clientSocket.emit('playerReady', roomName);
                    organizerSocket.emit('playerReady', roomName);
                }
            };

            clientSocket.once('joinRoomSuccess', () => {
                client1Joined = true;
                checkClientJoined();
            });

            organizerSocket.once('allPlayersReadyTest', () => {
                done();
            });
        });

        clientSocket.on('error', (error) => done(error));
        organizerSocket.on('error', (error) => done(error));
    });

    it('should process submitted answers and update player scores', (done) => {
        const roomName = 'AnswerSubmissionRoom';
        const quiz = {
            title: 'Answer Submission Quiz',
            description: 'Quiz to test answer submission.',
            duration: 30,
            hidden: false,
            questions: [
                {
                    type: 'multipleChoice',
                    text: 'What is 2+2?',
                    choices: [
                        { text: '4', isCorrect: true, _id: '1', id: '1' },
                        { text: '22', isCorrect: false, _id: '2', id: '2' },
                    ],
                    points: 10,
                },
            ],
        };

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, 'Player1');
            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('startGame', roomName);
                organizerSocket.once('startGame', () => {
                    organizerSocket.emit('nextQuestion', roomName);
                    const selectedAnswerIndices = [0];
                    clientSocket.emit('submitAnswers', { roomName, selectedAnswerIndices });

                    clientSocket.once('allPlayersAnsweredTest', (correctAnswerIndices) => {
                        expect(correctAnswerIndices).to.deep.equal([0]);
                        clientSocket.once('updatePoints', ({ points, bonus }) => {
                            console.log(points);
                            expect(points).to.be.a('number').that.equals(12);
                            expect(bonus).to.be.true;

                            done();
                        });
                    });
                });
            });
        });

        clientSocket.on('error', (error) => done(new Error(`Player socket error: ${error.message}`)));
        organizerSocket.on('error', (error) => done(new Error(`Organizer socket error: ${error.message}`)));
    });

    it('should fail if player answers more answers then the amount of correct responses', (done) => {
        const roomName = 'AnswerSubmissionRoom';
        const quiz = {
            title: 'Answer Submission Quiz',
            description: 'Quiz to test answer submission.',
            duration: 30,
            hidden: false,
            questions: [
                {
                    type: 'multipleChoice',
                    text: 'What is 2+2?',
                    choices: [
                        { text: '4', isCorrect: true, _id: '1', id: '1' },
                        { text: '22', isCorrect: false, _id: '2', id: '2' },
                    ],
                    points: 10,
                },
            ],
        };
        const player1 = {
            id: '123',
            name: 'Player1',
            points: 0,
            bonuses: 0,
            submittedAnswerIndices: [0, 1],
            ready: true,
        };
        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, player1);
            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('startGame', roomName);
                organizerSocket.once('startGame', () => {
                    organizerSocket.emit('nextQuestion', roomName);
                    const selectedAnswerIndices = [0, 1];
                    clientSocket.emit('submitAnswers', { roomName, selectedAnswerIndices });

                    clientSocket.once('allPlayersAnsweredTest', (correctAnswerIndices) => {
                        expect(correctAnswerIndices).to.deep.equal([0]);
                        console.log(player1.points);
                        expect(player1.points).to.be.a('number').that.equals(0);
                        expect(player1.bonuses).to.be.a('number').that.equals(0);

                        done();
                    });
                });
            });
        });

        clientSocket.on('error', (error) => done(new Error(`Player socket error: ${error.message}`)));
        organizerSocket.on('error', (error) => done(new Error(`Organizer socket error: ${error.message}`)));
    });

    it('should update answer counts on answer selection and deselection', (done) => {
        const roomName = 'ToggleAnswerTestRoom';
        const quiz = {
            title: 'Answer Submission Quiz',
            description: 'Quiz to test answer submission.',
            duration: 30,
            hidden: false,
            questions: [
                {
                    type: 'multipleChoice',
                    text: 'What is 2+2?',
                    choices: [
                        { text: '4', isCorrect: true, _id: '1', id: '1' },
                        { text: '22', isCorrect: false, _id: '2', id: '2' },
                    ],
                    points: 10,
                },
            ],
        };

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, 'Player1');

            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('startGame', roomName);

                organizerSocket.once('startGame', () => {
                    organizerSocket.emit('nextQuestion', roomName);
                    const answerIndex = 1;
                    clientSocket.emit('toggleSelectAnswer', { roomName, answerIndex, answerSelected: true });

                    organizerSocket.once('histogramDataUpdated', (histogramData) => {
                        const updatedCount = histogramData.choicesData[answerIndex].count;
                        expect(updatedCount).to.equal(0);

                        clientSocket.emit('toggleSelectAnswer', { roomName, answerIndex, answerSelected: false });
                        console.log('toggled asnwer');
                        clientSocket.once('histogramDataUpdated', (newHistogramData) => {
                            console.log('pooooooop');

                            const newCount = newHistogramData.choicesData[answerIndex].count;
                            expect(newCount).to.equal(0); // Assuming the deselection resets it back to the initial state

                            done();
                        });
                    });
                });
            });
        });

        clientSocket.on('error', (error) => done(new Error(`Player socket error: ${error.message}`)));
        organizerSocket.on('error', (error) => done(new Error(`Organizer socket error: ${error.message}`)));
    });

    it('should return the current list of players in a room upon request', (done) => {
        const roomName = 'PlayerListTestRoom';
        const quiz = {
            title: 'Answer Submission Quiz',
            description: 'Quiz to test answer submission.',
            duration: 30,
            hidden: false,
            questions: [
                {
                    type: 'multipleChoice',
                    text: 'What is 2+2?',
                    choices: [
                        { text: '4', isCorrect: true, _id: '1', id: '1' },
                        { text: '22', isCorrect: false, _id: '2', id: '2' },
                    ],
                    points: 10,
                },
            ],
        };
        const playerName1 = 'Player1';

        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', () => {
            clientSocket.emit('joinRoom', roomName, playerName1);
            clientSocket.once('joinRoomSuccess', () => {
                organizerSocket.emit('requestCurrentPlayers', roomName);
                organizerSocket.once('updatePlayers', (players) => {
                    expect(players).to.be.an('array').that.is.not.empty;
                    const playerNames = players.map((player: Player) => player.name);
                    expect(playerNames).to.include.members([playerName1]);
                    done();
                });
            });
        });

        // Handle any potential errors during the test
        clientSocket.on('error', (error) => done(new Error(`Client socket error: ${error.message}`)));
        organizerSocket.on('error', (error) => done(new Error(`Organizer socket error: ${error.message}`)));
    });

    it('should handle requestPlayers when room doesnt exist', (done) => {
        const roomName = 'PlayerListTestRoom';

        organizerSocket.emit('requestCurrentPlayers', roomName);
        organizerSocket.once('updatePlayersError', (error) => {
            expect(error).to.exist;
            expect(error.message).to.include("Cette salle n'existe pas");
            done();
        });

        // Handle any potential errors during the test
        clientSocket.on('error', (error) => done(new Error(`Client socket error: ${error.message}`)));
    });

    it('should emit showResults with correct data when showResults event is received', (done) => {
        const roomName = 'ResultsTestRoom';
        const quiz = {
            title: 'Results Quiz',
            description: 'Quiz to test showResults functionality.',
            duration: 30,
            hidden: false,
            questions: [
                {
                    text: 'Question 1?',
                    choices: [{ text: 'Answer 1', isCorrect: true }],
                    points: 10,
                },
            ],
        };

        // Create a room
        organizerSocket.emit('createRoom', { roomName, quiz });

        organizerSocket.once('roomCreated', (room) => {
            expect(room).to.exist;

            organizerSocket.emit('showResults', roomName);

            organizerSocket.once('showResultsTest', (data) => {
                expect(data).to.exist;
                expect(data).to.have.property('playerList').that.is.an('array');
                expect(data).to.have.property('histogramData').that.is.an('array');
                expect(data).to.have.property('quiz').that.deep.equals(quiz);

                done();
            });
        });
        organizerSocket.on('error', (error) => done(new Error(`Organizer socket error: ${error.message}`)));
    });
});
