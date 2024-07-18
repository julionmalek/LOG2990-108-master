import {
    IQuiz,
    addQuiz as addQuizToDB,
    deleteQuiz as deleteQuizFromDB,
    getAllQuizzes,
    getQuizById as getQuizByIDDB,
    updateQuiz as updateQuizFromDB,
} from '@app/db/quizes';
import { HTTP_STATUS } from '@utilities/constants';
import * as express from 'express';

export const getQuizzes = async (req: express.Request, res: express.Response) => {
    try {
        const quizzes = await getAllQuizzes();

        return res.status(HTTP_STATUS.Ok).json(quizzes);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};

export const createQuiz = async (req: express.Request, res: express.Response) => {
    try {
        const questionData: IQuiz = req.body;
        const newQuestion = await addQuizToDB(questionData);
        return res.status(HTTP_STATUS.Created).json(newQuestion);
    } catch (error) {
        if (error.message === 'Un quiz avec ce nom existe déjà. Veuillez choisir un autre nom.') {
            return res.status(HTTP_STATUS.Conflict).send(error.message);
        }
        return res.status(HTTP_STATUS.InternalServerError).send('Error while adding the question');
    }
};

export const deleteQuiz = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const deletedQuizzes = await deleteQuizFromDB(id);
        return res.json(deletedQuizzes);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};

export const updateQuiz = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id;
        const quizData = req.body;
        const updatedQuiz = await updateQuizFromDB(id, quizData);

        if (!updatedQuiz) {
            return res.status(HTTP_STATUS.NotFound).send('Quiz not found');
        }

        return res.status(HTTP_STATUS.Ok).json(updatedQuiz);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};

export const getQuizById = async (req: express.Request, res: express.Response) => {
    try {
        const quizId = req.params.id;
        const quiz = await getQuizByIDDB(quizId);

        if (!quiz) {
            return res.status(HTTP_STATUS.NotFound).send('Quiz not found');
        }
        return res.status(HTTP_STATUS.Ok).json(quiz);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};
