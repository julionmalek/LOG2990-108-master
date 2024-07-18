import { HTTP_STATUS } from '@utilities/constants';
import * as express from 'express';

const activeGameIds = new Set<string>();
const BASE_36 = 36;
const RANDOM_LENGTH = 4;

export const validateGameId = async (req: express.Request, res: express.Response) => {
    const { gameId } = req.params;

    const isValid = activeGameIds.has(gameId);

    if (isValid) {
        res.status(HTTP_STATUS.Ok).json({ isValid: true });
    } else {
        res.status(HTTP_STATUS.NotFound).json({ isValid: false, message: 'Game ID not found.' });
    }
};

export const createGame = async (req: express.Request, res: express.Response) => {
    let gameId;
    do {
        const randomChars = Math.random().toString(BASE_36);
        gameId = randomChars.slice(randomChars.length - RANDOM_LENGTH).toUpperCase();
    } while (activeGameIds.has(gameId));

    activeGameIds.add(gameId);

    res.status(HTTP_STATUS.Created).json({ gameId });
};

export const deleteGameId = async (req: express.Request, res: express.Response) => {
    const { gameId } = req.params;

    if (activeGameIds.has(gameId)) {
        activeGameIds.delete(gameId);
        res.status(HTTP_STATUS.Ok).json({ message: 'Game ID deleted successfully.' });
    } else {
        res.status(HTTP_STATUS.NotFound).json({ message: 'Game ID not found.' });
    }
};
