import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from '@app/controllers/questions.controllers';
import * as express from 'express';

export default (router: express.Router) => {
    router.get('/questions', getQuestions);
    router.post('/questions', createQuestion);
    router.delete('/questions/:id', deleteQuestion);
    router.patch('/questions/:id', updateQuestion);
};
