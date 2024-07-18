import { IQuiz } from '@app/db/quizes';
import { GameMode } from '@common/game-mode';
import { HistogramData } from './histogram-data';
import { Player } from './player';

export enum GameState {
    Waiting = 'waiting',
    AnsweringQuestion = 'answeringQuestion', // Timer is running, players can select answers
    ShowingAnswers = 'showingAnswers', // All answers are final, correct answers shown, Organizer can go to next question or to results
    ShowingResults = 'showingResults',
}

export interface GameRoom {
    name: string;
    organizerId: string;
    organizerReady: boolean;
    isLobbyLocked: boolean;
    gameState: GameState;
    gameMode: GameMode;
    currentQuestionIndex: number;
    players: Player[];
    answeredPlayers: Player[];
    bannedNames: string[];
    quiz: IQuiz;
    questionsAnswerCounts: Map<number, number>[];
    histogramData?: HistogramData[];
}
