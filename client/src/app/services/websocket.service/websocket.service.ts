import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { QuestionData } from '@app/interfaces/question-data';
import { Quiz } from '@app/interfaces/quiz';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

interface KickEventData {
    reason: string;
}
export interface Message {
    user: string;
    message: string;
    timestamp?: Date;
    isOrganizer?: boolean;
}

export interface ChoiceData {
    title: string;
    count: number;
    isCorrect: boolean;
}

export interface HistogramData {
    questionTitle: string;
    choicesData: ChoiceData[];
}

@Injectable({
    providedIn: 'root',
})
export class WebsocketService {
    connected$: Observable<boolean>;
    private socket: Socket;
    private bIsOrganizer: boolean = false;
    private playerName: string = '';
    private connectedSubject = new Subject<boolean>();

    constructor() {
        this.connected$ = this.connectedSubject.asObservable();
        this.socket = io(environment.serverUrl);
        this.socket.on('connect', () => {
            this.connectedSubject.next(true);
        });
    }

    get socketId(): string {
        return this.socket.id || '';
    }

    get isOrganizer(): boolean {
        return this.bIsOrganizer;
    }

    set isOrganizer(value: boolean) {
        this.bIsOrganizer = value;
    }

    setPlayerName(name: string) {
        this.playerName = name;
    }

    getPlayerName(): string {
        return this.playerName;
    }

    connect() {
        this.socket.connect();
    }

    disconnect() {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
            this.connectedSubject.next(false);
        }
    }

    listenForKick(): Observable<KickEventData> {
        return new Observable((observer) => {
            this.socket.on('kick', (data) => {
                observer.next(data);
            });
        });
    }

    onHistogramDataUpdated(): Observable<HistogramData> {
        return new Observable<HistogramData>((observer) => {
            this.socket.on('histogramDataUpdated', (data: HistogramData) => {
                observer.next(data);
            });
        });
    }

    reset() {
        this.bIsOrganizer = false;
        this.playerName = '';
        this.socket.disconnect();
        this.socket = io(environment.serverUrl);

        this.socket.on('connect', () => {
            this.connectedSubject.next(true);
        });
    }

    listenForRoomClosure(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on('roomClosed', (message: string) => {
                observer.next(message);
            });
        });
    }

    createRoom(roomName: string, quiz: Quiz) {
        this.socket.emit('createRoom', { roomName, quiz });
    }

    createTestRoom(quiz: Quiz) {
        this.socket.emit('createTestRoom', quiz);
    }

    joinRoom(roomName: string, playerName: string) {
        this.setPlayerName(playerName);
        this.socket.emit('joinRoom', roomName, playerName);
    }

    handleLockState(roomName: string, isLocked: boolean) {
        this.socket.emit('toggleLockRoom', { roomName, isLocked });
    }

    startGame(roomName: string) {
        this.socket.emit('startGame', roomName);
    }

    leaveRoom(gameId: string) {
        this.socket.emit('leaveRoom', gameId);
        this.disconnect();
    }

    sendMessage(message: Message, roomName: string) {
        this.socket.emit('message', { message, roomName });
    }

    playerReady(roomName: string) {
        this.socket.emit('playerReady', roomName);
    }

    onMessage(): Observable<Message> {
        return new Observable((observer) => {
            this.socket.on('message', (data: Message) => {
                observer.next(data);
            });
        });
    }

    onPastMessages(): Observable<Message[]> {
        return new Observable((observer) => {
            this.socket.on('pastMessages', (messages: Message[]) => {
                observer.next(messages);
            });
        });
    }

    onPlayerJoined(): Observable<Player> {
        return new Observable((observer) => {
            this.socket.on('playerJoined', (player) => {
                observer.next(player);
            });
        });
    }

    onPlayersUpdated(): Observable<Player[]> {
        return new Observable((observer) => {
            this.socket.on('updatePlayers', (players: Player[]) => {
                observer.next(players);
            });
        });
    }

    onJoinConfirmed(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on('joinConfirmed', () => {
                observer.next();
            });
        });
    }

    listenForJoinError(): Observable<{ message: string }> {
        return new Observable((observer) => {
            this.socket.on('joinError', (data) => {
                observer.next(data);
            });
        });
    }

    requestCurrentPlayers(roomName: string): void {
        this.socket.emit('requestCurrentPlayers', roomName);
    }

    requestJoinRoomValidation(roomName: string, playerName: string): void {
        this.socket.emit('requestJoinRoomValidation', { roomName, playerName });
    }

    listenForLobbyLocked(): Observable<{ message: string }> {
        return new Observable((observer) => {
            this.socket.on('lobbyLocked', (data) => {
                observer.next(data);
            });
        });
    }

    removePlayer(roomName: string, playerId: string) {
        this.socket.emit('removePlayer', { roomName, playerId });
    }

    onPlayerLeft(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on('playerLeft', (playerId) => {
                observer.next(playerId);
            });
        });
    }

    tryJoinRoom(roomName: string, playerName: string) {
        this.socket.emit('tryJoinRoom', { roomName, playerName });
    }

    submitAnswers(roomName: string, selectedAnswerIndices: number[]) {
        this.socket.emit('submitAnswers', { roomName, selectedAnswerIndices });
    }

    nextQuestion(roomName: string) {
        this.socket.emit('nextQuestion', roomName);
    }

    showResults(roomName: string) {
        this.socket.emit('showResults', roomName);
    }

    toggleSelectAnswer(roomName: string, answerIndex: number, answerSelected: boolean) {
        this.socket.emit('toggleSelectAnswer', { roomName, answerIndex, answerSelected });
    }

    onStartGame(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on('startGame', (title: string) => {
                observer.next(title);
            });
        });
    }

    onAllPlayersReady(): Observable<void> {
        return new Observable((observer) => {
            this.socket.on('allPlayersReady', () => {
                observer.next();
            });
        });
    }

    onNextQuestion(): Observable<QuestionData> {
        return new Observable((observer) => {
            this.socket.on('nextQuestion', (questionData: QuestionData) => {
                observer.next(questionData);
            });
        });
    }

    onShowResults(): Observable<{ playerList: Player[]; histogramData: { [key: string]: number }[]; quiz: Quiz }> {
        return new Observable((observer) => {
            this.socket.on('showResults', ({ playerList, histogramData, quiz }) => {
                observer.next({ playerList, histogramData, quiz });
            });
        });
    }

    onAllPlayersAnswered(): Observable<number[]> {
        return new Observable((observer) => {
            this.socket.on('allPlayersAnswered', (correctAnswerIndices: number[]) => {
                observer.next(correctAnswerIndices);
            });
        });
    }

    onUpdatePoints(): Observable<{ points: number; bonus: boolean }> {
        return new Observable((observer) => {
            this.socket.on('updatePoints', ({ points, bonus }) => {
                observer.next({ points, bonus });
            });
        });
    }
}
