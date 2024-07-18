export interface GamePageState {
    countdown: number;
    countdownTotal: number;
    totalPoints: number;
    showBonus: boolean;
    showAnswers: boolean;
    transitionToNextQuestion: boolean;
    submittedAnswers: boolean;
    focusedOnInput: boolean;
    allowRedirectWithoutConfirm: boolean;
    selectedAnswerIndices: number[];
    correctAnswerIndices: number[];
}
