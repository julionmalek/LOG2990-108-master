import * as express from 'express';

import validateGameId from './game-id';
import questions from './questions';
import quizzes from './quiz';
const router = express.Router();

export default (): express.Router => {
    questions(router);
    quizzes(router);
    validateGameId(router);
    return router;
};
