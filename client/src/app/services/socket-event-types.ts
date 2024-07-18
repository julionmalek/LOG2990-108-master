import { Quiz } from '@app/interfaces/quiz';
import { Message } from './websocket.service/websocket.service';
export enum GameState {
    Waiting = 'waiting',
    AnsweringQuestion = 'answeringQuestion',
    ShowingAnswers = 'showingAnswers',
    ShowingResults = 'showingResults',
}
export interface SocketEventMap {
    disconnect: undefined;
    joinRoom: { roomName: string; playerName: string };
    createRoom: { roomName: string; quiz: Quiz };
    leaveRoom: string;
    sendMessageToRoom: { roomName: string; message: string };
    toggleLockRoom: { roomName: string; isLocked: boolean };
    startGame: string;
    playerReady: string;
    nextQuestion: string;
    message: { message: Message; roomName: string };
    showResults: string;
    requestCurrentPlayers: string;
    requestJoinRoomValidation: { roomName: string; playerName: string };
    toggleSelectAnswer: { roomName: string; answerIndex: number; answerSelected: boolean };
    submitAnswers: { roomName: string; selectedAnswerIndices: number[] };
    removePlayer: { roomName: string; playerId: string };
    tryJoinRoom: { roomName: string; playerName: string };
    createTestRoom: Quiz;
}
export type SocketEmit<T extends keyof SocketEventMap> = (event: T, data: SocketEventMap[T]) => void;
export type SocketOn<T extends keyof SocketEventMap> = (event: T, callback: (data: SocketEventMap[T]) => void) => void;
