/* eslint-disable @typescript-eslint/no-magic-numbers */
// This data is mainly used for the tests.
import { HistogramResult } from '@app/interfaces/histogram-results';

export const mockHistogramResults: HistogramResult[] = [
    {
        answerNumber: [1, 2, 3, 4],
        answerQuantity: [10, 2, 7, 5],
    },
    {
        answerNumber: [1, 2],
        answerQuantity: [3, 9],
    },
    {
        answerNumber: [1, 2, 3],
        answerQuantity: [1, 8, 4],
    },
];
