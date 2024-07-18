import { Question } from '@app/interfaces/question';

export interface Quiz {
    id?: string;
    hidden: boolean;
    title: string;
    description: string;
    duration: number;
    questions: Question[];
    lastModification: Date;
}
