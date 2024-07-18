export interface ExportedQuiz {
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: Date;
    questions: {
        type: string;
        text: string;
        points: number;
        choices: {
            text: string;
            isCorrect: boolean;
        }[];
    }[];
}
