import { createGame, deleteGameId, validateGameId } from '@app/controllers/game-id.controllers';
import * as express from 'express';

export default (router: express.Router) => {
    router.get('/validate-game/:gameId', validateGameId);
    router.post('/create-game', createGame);
    router.delete('/delete-game/:gameId', deleteGameId);
};
