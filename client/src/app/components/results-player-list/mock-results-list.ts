/* eslint-disable @typescript-eslint/no-magic-numbers */
// This data is mainly used for the tests
import { Player } from '@app/interfaces/player';

export const mockPlayerList: Player[] = [
    { id: '1', name: 'John', points: 100, bonuses: 3, submittedAnswerIndices: [1, 2, 3], ready: true },
    { id: '2', name: 'Johnny', points: 80, bonuses: 2, submittedAnswerIndices: [4, 5], ready: true },
    { id: '3', name: 'Jonathan', points: 120, bonuses: 4, submittedAnswerIndices: [6], ready: true },
    { id: '4', name: 'Jonny', points: 100, bonuses: 3, submittedAnswerIndices: [7, 8], ready: true },
    { id: '5', name: 'Johnnie', points: 90, bonuses: 2, submittedAnswerIndices: [9], ready: true },
    { id: '6', name: 'Johan', points: 85, bonuses: 2, submittedAnswerIndices: [10, 11], ready: true },
    { id: '7', name: 'Joan', points: 110, bonuses: 4, submittedAnswerIndices: [12, 13], ready: true },
    { id: '8', name: 'Joanne', points: 105, bonuses: 3, submittedAnswerIndices: [14], ready: true },
    { id: '9', name: 'Johnson', points: 100, bonuses: 3, submittedAnswerIndices: [15, 16], ready: true },
    { id: '10', name: 'Joey', points: 95, bonuses: 2, submittedAnswerIndices: [17], ready: true },
    { id: '11', name: 'Rohn', points: 100, bonuses: 3, submittedAnswerIndices: [18, 19], ready: true },
    { id: '12', name: 'Joseph', points: 115, bonuses: 4, submittedAnswerIndices: [20, 21], ready: true },
    { id: '13', name: 'Josie', points: 100, bonuses: 3, submittedAnswerIndices: [22], ready: true },
    { id: '14', name: 'Joss', points: 90, bonuses: 2, submittedAnswerIndices: [23, 24], ready: true },
    { id: '15', name: 'Josiah', points: 100, bonuses: 3, submittedAnswerIndices: [25], ready: true },
    { id: '16', name: 'Jolyon', points: 85, bonuses: 2, submittedAnswerIndices: [26, 27], ready: true },
    { id: '17', name: 'Rovie', points: 100, bonuses: 3, submittedAnswerIndices: [28, 29], ready: true },
    { id: '18', name: 'Jovan', points: 110, bonuses: 4, submittedAnswerIndices: [30], ready: true },
    { id: '19', name: 'Jovita', points: 100, bonuses: 3, submittedAnswerIndices: [31, 32], ready: true },
    { id: '20', name: 'Jovanni', points: 95, bonuses: 2, submittedAnswerIndices: [33], ready: true },
];

export const expectedResultList: Player[] = [
    { id: '3', name: 'Jonathan', points: 120, bonuses: 4, submittedAnswerIndices: [6], ready: true },
    { id: '12', name: 'Joseph', points: 115, bonuses: 4, submittedAnswerIndices: [20, 21], ready: true },
    { id: '7', name: 'Joan', points: 110, bonuses: 4, submittedAnswerIndices: [12, 13], ready: true },
    { id: '18', name: 'Jovan', points: 110, bonuses: 4, submittedAnswerIndices: [30], ready: true },
    { id: '8', name: 'Joanne', points: 105, bonuses: 3, submittedAnswerIndices: [14], ready: true },
    { id: '1', name: 'John', points: 100, bonuses: 3, submittedAnswerIndices: [1, 2, 3], ready: true },
    { id: '9', name: 'Johnson', points: 100, bonuses: 3, submittedAnswerIndices: [15, 16], ready: true },
    { id: '4', name: 'Jonny', points: 100, bonuses: 3, submittedAnswerIndices: [7, 8], ready: true },
    { id: '15', name: 'Josiah', points: 100, bonuses: 3, submittedAnswerIndices: [25], ready: true },
    { id: '13', name: 'Josie', points: 100, bonuses: 3, submittedAnswerIndices: [22], ready: true },
    { id: '19', name: 'Jovita', points: 100, bonuses: 3, submittedAnswerIndices: [31, 32], ready: true },
    { id: '11', name: 'Rohn', points: 100, bonuses: 3, submittedAnswerIndices: [18, 19], ready: true },
    { id: '17', name: 'Rovie', points: 100, bonuses: 3, submittedAnswerIndices: [28, 29], ready: true },
    { id: '10', name: 'Joey', points: 95, bonuses: 2, submittedAnswerIndices: [17], ready: true },
    { id: '20', name: 'Jovanni', points: 95, bonuses: 2, submittedAnswerIndices: [33], ready: true },
    { id: '5', name: 'Johnnie', points: 90, bonuses: 2, submittedAnswerIndices: [9], ready: true },
    { id: '14', name: 'Joss', points: 90, bonuses: 2, submittedAnswerIndices: [23, 24], ready: true },
    { id: '6', name: 'Johan', points: 85, bonuses: 2, submittedAnswerIndices: [10, 11], ready: true },
    { id: '16', name: 'Jolyon', points: 85, bonuses: 2, submittedAnswerIndices: [26, 27], ready: true },
    { id: '2', name: 'Johnny', points: 80, bonuses: 2, submittedAnswerIndices: [4, 5], ready: true },
];
