import { createGame, deleteGameId, validateGameId } from '@app/controllers/game-id.controllers';
import { HTTP_STATUS } from '@utilities/constants';
import * as chai from 'chai';
import * as express from 'express';
import * as supertest from 'supertest';

const expect = chai.expect;
const app = express();
app.get('/game/:gameId', validateGameId);
app.post('/game', createGame);
app.delete('/game/:gameId', deleteGameId);
const request = supertest(app);

describe('GameIdController', () => {
    it('validateGameId should return NotFound when gameId is not found', async () => {
        await request
            .get('/game/nonexistent')
            .expect(HTTP_STATUS.NotFound)
            .then((response) => {
                expect(response.body).to.deep.equal({ isValid: false, message: 'Game ID not found.' });
            });
    });
    it('validateGameId should return Ok when gameId is found', async () => {
        const response = await request.post('/game').expect(HTTP_STATUS.Created);
        const { gameId } = response.body;
        await request
            .get(`/game/${gameId}`)
            .expect(HTTP_STATUS.Ok)
            .then((innerResponse) => {
                expect(innerResponse.body).to.deep.equal({ isValid: true });
            });
    });

    it('deleteGameId should return Ok when gameId is found', async () => {
        const response = await request.post('/game').expect(HTTP_STATUS.Created);
        const { gameId } = response.body;
        await request
            .delete(`/game/${gameId}`)
            .expect(HTTP_STATUS.Ok)
            .then((innerResponse) => {
                expect(innerResponse.body).to.deep.equal({ message: 'Game ID deleted successfully.' });
            });
    });

    it('createGame should return Created and a gameId', async () => {
        await request
            .post('/game')
            .expect(HTTP_STATUS.Created)
            .then((response) => {
                expect(response.body).to.have.property('gameId');
            });
    });

    it('deleteGameId should return NotFound when gameId is not found', async () => {
        await request
            .delete('/game/nonexistent')
            .expect(HTTP_STATUS.NotFound)
            .then((response) => {
                expect(response.body).to.deep.equal({ message: 'Game ID not found.' });
            });
    });
});
