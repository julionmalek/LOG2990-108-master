export interface QuestionData {
    type: string;
    text: string;
    points: number;
    choices: { text: string }[];
    index: number;
    isLastQuestion: boolean;
    duration: number;
}
