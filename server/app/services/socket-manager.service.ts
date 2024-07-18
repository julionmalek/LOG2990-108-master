// We deemed a good idea to not split it in different parts.
/* eslint-disable max-lines */
import { ChoiceData } from '@app/interfaces/choice-data';
import { GameRoom, GameState } from '@app/interfaces/game-room';
import { HistogramData } from '@app/interfaces/histogram-data';
import { Message } from '@app/interfaces/message';
import { Player } from '@app/interfaces/player';
import { GameMode } from '@common/game-mode';
import { TEST_VALIDATION, VALIDATION } from '@utilities/constants';
import * as http from 'http';
import { Server as IOServer, Socket } from 'socket.io';

export class SocketManager {
    private sio: IOServer;
    private gameRooms: GameRoom[] = [];
    private playerSockets: Map<string, Socket> = new Map();
    private roomMessages: { [key: string]: Message[] } = {};

    constructor(server: http.Server) {
        this.sio = new IOServer(server, {
            cors: {
                methods: ['GET', 'POST'],
            },
        });
    }

    getIOServer(): IOServer {
        return this.sio;
    }

    getGameRooms(): GameRoom[] {
        return this.gameRooms;
    }

    generateHistogramData(room: GameRoom): HistogramData {
        const questionTitle = room.quiz.questions[room.currentQuestionIndex].text;
        const choicesData: ChoiceData[] = room.quiz.questions[room.currentQuestionIndex].choices.map((choice, index) => {
            const count = room.questionsAnswerCounts[room.currentQuestionIndex].get(index) || 0;
            return {
                title: choice.text,
                count,
                isCorrect: choice.isCorrect,
            };
        });

        const histogramData: HistogramData = {
            questionTitle,
            choicesData,
        };
        return histogramData;
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.on('createRoom', ({ roomName, quiz }) => {
                if (!this.gameRooms.some((room) => room.name === roomName)) {
                    const newRoom: GameRoom = {
                        name: roomName,
                        organizerId: socket.id,
                        organizerReady: false,
                        isLobbyLocked: false,
                        gameState: GameState.Waiting,
                        gameMode: GameMode.Normal,
                        currentQuestionIndex: VALIDATION.NOT_FOUND_INDEX,
                        players: [],
                        answeredPlayers: [],
                        bannedNames: [],
                        quiz,
                        questionsAnswerCounts: [],
                        histogramData: [],
                    };
                    newRoom.quiz.questions.forEach((question, qIndex) => {
                        newRoom.questionsAnswerCounts[qIndex] = new Map<number, number>();
                        question.choices.forEach((_choice, cIndex) => {
                            newRoom.questionsAnswerCounts[qIndex].set(cIndex, 0);
                        });
                    });
                    this.gameRooms.push(newRoom);
                    socket.emit('roomCreated', newRoom);
                } else {
                    socket.emit('roomCreationError', { message: 'Cette salle existe déjà.' });
                }
            });

            socket.on('createTestRoom', (quiz) => {
                if (!this.gameRooms.some((room) => room.name === socket.id)) {
                    const newRoom: GameRoom = {
                        name: socket.id,
                        organizerId: socket.id,
                        organizerReady: false,
                        isLobbyLocked: false,
                        gameState: GameState.Waiting,
                        gameMode: GameMode.Testing,
                        currentQuestionIndex: VALIDATION.NOT_FOUND_INDEX,
                        players: [
                            {
                                id: socket.id,
                                name: 'test-player',
                                points: 0,
                                bonuses: 0,
                                submittedAnswerIndices: [],
                                ready: false,
                                isActive: true,
                            },
                        ],
                        answeredPlayers: [],
                        bannedNames: [],
                        quiz,
                        questionsAnswerCounts: [],
                        histogramData: [],
                    };

                    this.gameRooms.push(newRoom);
                    socket.emit('testRoomCreated', newRoom);
                } else {
                    socket.emit('testRoomCreationError', { message: 'Cette salle existe déjà.' });
                }
            });

            socket.on('joinRoom', (roomName, playerName) => {
                const roomToJoin = this.gameRooms.find((room) => room.name === roomName);
                if (roomToJoin) {
                    socket.join(roomName);
                    if (socket.id !== roomToJoin.organizerId) {
                        const newPlayer: Player = {
                            id: socket.id,
                            name: playerName,
                            points: 0,
                            bonuses: 0,
                            submittedAnswerIndices: [],
                            ready: false,
                            isActive: true,
                        };
                        roomToJoin.players.push(newPlayer);
                        this.playerSockets.set(newPlayer.id, socket);
                        socket.to(roomName).emit('playerJoined', newPlayer);
                        this.sio.in(roomName).emit('updatePlayers', roomToJoin.players);
                        socket.emit('joinRoomSuccess', { roomName, playerName });
                    } else {
                        socket.emit('joinErrorJoinRoom', { message: 'Vous êtes déjà dans cette salle.' });
                    }

                    const pastMessages = this.roomMessages[roomName] || [];
                    socket.emit('pastMessages', pastMessages);
                } else {
                    socket.emit('joinErrorJoinRoom', { message: "Cette salle n'existe pas" });
                }
            });

            socket.on('requestJoinRoomValidation', ({ roomName, playerName }) => {
                const room = this.gameRooms.find((r) => r.name === roomName);
                if (!room) {
                    socket.emit('joinError', { message: "Cette salle n'existe pas" });
                    return;
                }
                if (room.isLobbyLocked) {
                    socket.emit('joinError', { message: 'Cette salle est actuellement verrouillée.' });
                    return;
                }

                if (
                    room.bannedNames.includes(playerName.toLowerCase()) ||
                    room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())
                ) {
                    socket.emit('joinError', { message: 'Ce nom est déjà utilisé ou interdit.' });
                } else {
                    socket.emit('joinConfirmed', { message: 'Join confirmed' });
                }
            });

            socket.on('requestCurrentPlayers', (roomName) => {
                const room = this.gameRooms.find((currentRoom) => currentRoom.name === roomName);
                if (room) {
                    socket.emit('updatePlayers', room.players);
                } else {
                    socket.emit('updatePlayersError', { message: "Cette salle n'existe pas" });
                }
            });

            socket.on('removePlayer', (playerInfo) => {
                const playerSocket = this.playerSockets.get(playerInfo.playerId);
                if (playerSocket) {
                    playerSocket.leave(playerInfo.roomName);
                    const roomOfThePlayer = this.gameRooms.find((room) => room.name === playerInfo.roomName);

                    if (roomOfThePlayer) {
                        const playerIndex = roomOfThePlayer.players.findIndex((p) => p.id === playerInfo.playerId);
                        const validityIndexCheck = -1;

                        if (playerIndex > validityIndexCheck) {
                            roomOfThePlayer.players[playerIndex].isActive = false;
                            roomOfThePlayer.bannedNames.push(roomOfThePlayer.players[playerIndex].name.toLowerCase());
                            roomOfThePlayer.players.splice(playerIndex, 1);
                            this.sio.in(playerInfo.roomName).emit('updatePlayers', roomOfThePlayer.players);
                        }
                    }
                    playerSocket.emit('kick', { reason: 'Vous avez été retiré du jeu.' });
                    this.playerSockets.delete(playerInfo.playerId);
                } else {
                    socket.emit('removePlayerDoesntExist', { message: "Le joueur n'existe pas." });
                }
            });

            socket.on('leaveRoom', (gameId) => {
                const roomToLeave = this.gameRooms.find((room) => room.name === gameId);
                if (roomToLeave) {
                    const playerLeavingIndex = roomToLeave.players.findIndex((p) => p.id === socket.id);
                    const verifactionIndexCheck = -1;
                    if (playerLeavingIndex !== verifactionIndexCheck) {
                        roomToLeave.players[playerLeavingIndex].isActive = false;
                    }
                    roomToLeave.players = roomToLeave.players.filter((p) => p.id !== socket.id);
                    this.sio.in(gameId).emit('updatePlayers', roomToLeave.players);
                    socket.emit('leftRoom', roomToLeave.players);

                    if (roomToLeave.players.length === 0 && roomToLeave.gameState !== GameState.Waiting) {
                        this.sio.to(roomToLeave.organizerId).emit('roomClosed', 'La partie est terminée parce que tous les joueurs ont quitté.');
                        socket.emit('roomClosedTest', 'La partie est terminée parce que tous les joueurs ont quitté.');
                        roomToLeave.players = [];
                        this.gameRooms = this.gameRooms.filter((r) => r.name !== gameId);
                    }

                    if (socket.id === roomToLeave.organizerId) {
                        this.sio.in(roomToLeave.name).emit('roomClosed', "La partie est terminée parce que l'organisateur a quitté.");
                        socket.emit('roomClosedTest', "La partie est terminée parce que l'organisateur a quitté.");
                        roomToLeave.players = [];
                        this.gameRooms = this.gameRooms.filter((r) => r.name !== gameId);
                    }
                }
                socket.leave(gameId);
            });

            socket.on('message', ({ roomName, message }: { roomName: string; message: Message }) => {
                const timestampedMessage = { ...message, timestamp: new Date() };

                if (!this.roomMessages[roomName]) {
                    this.roomMessages[roomName] = [];
                }
                this.roomMessages[roomName].push(timestampedMessage);
                this.sio.to(roomName).emit('message', timestampedMessage);
                socket.emit('messageSent', timestampedMessage);
            });

            socket.on('toggleLockRoom', ({ roomName, isLocked }) => {
                const room = this.gameRooms.find((r) => r.name === roomName);
                if (room) {
                    room.isLobbyLocked = isLocked;
                }
            });

            socket.on('startGame', (roomName) => {
                const room = this.gameRooms.find((r) => r.name === roomName);
                if (room) {
                    room.gameState = GameState.AnsweringQuestion;
                    this.sio.to(roomName).emit('startGame', room.quiz.title);
                    socket.emit('startGame', room.quiz.title);
                }
            });

            socket.on('playerReady', (roomName) => {
                const room = this.gameRooms.find((r) => r.name === roomName);
                if (room) {
                    if (socket.id === room.organizerId) {
                        room.organizerReady = true;
                    }
                    const player = room.players.find((p) => p.id === socket.id);
                    if (player) player.ready = true;
                    if (room.players.every((p) => p.ready) && room.organizerReady) {
                        this.sio.to(room.organizerId).emit('allPlayersReady');
                        socket.emit('allPlayersReadyTest');
                    }

                    const pastMessages = this.roomMessages[roomName] || [];
                    socket.emit('pastMessages', pastMessages);
                }
            });

            socket.on('nextQuestion', (roomName) => {
                const room = this.gameRooms.find((r) => r.name === roomName);

                if (room) {
                    room.answeredPlayers = [];
                    room.currentQuestionIndex++;
                    const currentQuestion = room.quiz.questions[room.currentQuestionIndex];
                    this.sio.to(roomName).emit('nextQuestion', {
                        type: currentQuestion.type,
                        text: currentQuestion.text,
                        points: currentQuestion.points,
                        choices: currentQuestion.choices.map((choice) => ({ text: choice.text })),
                        index: room.currentQuestionIndex,
                        isLastQuestion: room.currentQuestionIndex + 1 === room.quiz.questions.length,
                        duration: room.quiz.duration,
                    });

                    socket.emit('nextQuestionTest', {
                        type: currentQuestion.type,
                        text: currentQuestion.text,
                        points: currentQuestion.points,
                        choices: currentQuestion.choices.map((choice) => ({ text: choice.text })),
                        index: room.currentQuestionIndex,
                        isLastQuestion: room.currentQuestionIndex + 1 === room.quiz.questions.length,
                        duration: room.quiz.duration,
                    });

                    socket.emit('nextQuestionTest', {
                        type: currentQuestion.type,
                        text: currentQuestion.text,
                        points: currentQuestion.points,
                        choices: currentQuestion.choices.map((choice) => ({ text: choice.text })),
                        index: room.currentQuestionIndex,
                        isLastQuestion: room.currentQuestionIndex + 1 === room.quiz.questions.length,
                        duration: room.quiz.duration,
                    });

                    if (room.gameMode !== GameMode.Testing) {
                        const histogramData = this.generateHistogramData(room);
                        this.sio.to(room.organizerId).emit('histogramDataUpdated', histogramData);
                    }
                }
            });

            socket.on('toggleSelectAnswer', ({ roomName, answerIndex, answerSelected }) => {
                const room = this.gameRooms.find((r) => r.name === roomName);
                if (!room || room.gameMode === GameMode.Testing) return;
                const currentCount = room.questionsAnswerCounts[room.currentQuestionIndex].get(answerIndex) || 0;
                room.questionsAnswerCounts[room.currentQuestionIndex].set(answerIndex, answerSelected ? currentCount - 1 : currentCount + 1);
                const histogramData = this.generateHistogramData(room);
                this.sio.in(roomName).emit('histogramDataUpdated', histogramData);
            });

            socket.on('submitAnswers', ({ roomName, selectedAnswerIndices }) => {
                const room = this.gameRooms.find((r) => r.name === roomName);
                if (room) {
                    const player = room.players.find((p) => p.id === socket.id);

                    if (player) {
                        player.submitTimestamp = Date.now();
                        player.submittedAnswerIndices = selectedAnswerIndices;
                        room.answeredPlayers.push(player);
                        if (room.players.length === room.answeredPlayers.length) {
                            const correctAnswerIndices = room.quiz.questions[room.currentQuestionIndex].choices
                                .map((choice, index) => ({ isCorrect: choice.isCorrect, index }))
                                .filter((choice) => choice.isCorrect)
                                .map((choice) => choice.index);

                            this.sio.to(roomName).emit('allPlayersAnswered', correctAnswerIndices);
                            socket.emit('allPlayersAnsweredTest', correctAnswerIndices);

                            const playersWithCorrectAnswers = room.players.filter((p) => {
                                if (p.submittedAnswerIndices.length !== correctAnswerIndices.length) {
                                    return false;
                                }
                                return p.submittedAnswerIndices.every((value, index) => value === correctAnswerIndices[index]);
                            });

                            const minTimestamp = Math.min(...playersWithCorrectAnswers.map((p) => p.submitTimestamp || Number.MAX_VALUE));
                            const playersWithMinTimestamp = playersWithCorrectAnswers.filter((p) => p.submitTimestamp === minTimestamp);

                            playersWithCorrectAnswers.forEach((p) => {
                                let pointsEarned = room.quiz.questions[room.currentQuestionIndex].points;
                                let bonusObtained = false;

                                if (playersWithMinTimestamp.length === 1 && p === playersWithMinTimestamp[0]) {
                                    pointsEarned += pointsEarned * TEST_VALIDATION.QUESTION_BONUS;
                                    bonusObtained = true;
                                    p.bonuses++;
                                }

                                p.points += pointsEarned;
                                this.sio.in(roomName).emit('updatePlayers', room.players);

                                this.sio.to(p.id).emit('updatePoints', { points: p.points, bonus: bonusObtained });
                            });
                        }
                    }
                }
            });

            socket.on('showResults', (roomName) => {
                const room = this.gameRooms.find((r) => r.name === roomName);

                if (room) {
                    room.gameState = GameState.ShowingResults;

                    const histogramData = room.questionsAnswerCounts.map((questionCountMap) => Object.fromEntries(questionCountMap));
                    this.sio.to(roomName).emit('showResults', { playerList: room.players, histogramData, quiz: room.quiz });
                    socket.emit('showResultsTest', { playerList: room.players, histogramData, quiz: room.quiz });
                }
            });
        });
    }
}
