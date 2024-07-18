export interface Player {
    id: string;
    name: string;
    points: number;
    bonuses: number;
    submittedAnswerIndices: number[];
    submitTimestamp?: number;
    ready: boolean;
    isActive?: boolean;
}
