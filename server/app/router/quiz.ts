import { createQuiz, deleteQuiz, getQuizById, getQuizzes, updateQuiz } from '@app/controllers/quiz.controllers';
import * as express from 'express';

export default (router: express.Router) => {
    router.get('/quiz', getQuizzes);
    router.post('/quiz', createQuiz);
    router.delete('/quiz/:id', deleteQuiz);
    router.patch('/quiz/:id', updateQuiz);
    router.get('/quiz/:id', getQuizById);
};
