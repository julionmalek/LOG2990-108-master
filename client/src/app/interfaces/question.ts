import { Choice } from '@app/interfaces/choice';

export interface Question {
    id?: string;
    type: string;
    text: string;
    choices: Choice[];
    points: number;
    showChoices?: boolean;
    lastModification: Date;
}
