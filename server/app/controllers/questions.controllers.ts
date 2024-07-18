import * as express from 'express';

import {
    IQuestion,
    addQuestion as addQuestionToDB,
    deleteQuestion as deleteQuestionFromDB,
    getAllQuestions,
    updateQuestion as updateQuestionFromDB,
} from '@app/db/questions';
import { HTTP_STATUS } from 'utilities/constants';

export const getQuestions = async (req: express.Request, res: express.Response) => {
    try {
        const questions = await getAllQuestions();

        return res.status(HTTP_STATUS.Ok).json(questions);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};

export const createQuestion = async (req: express.Request, res: express.Response) => {
    try {
        const questionData: IQuestion = req.body;
        const newQuestion = await addQuestionToDB(questionData);
        return res.status(HTTP_STATUS.Created).json(newQuestion);
    } catch (error) {
        if (error.message === 'Une question avec ce nom existe déjà. Veuillez choisir un autre nom.') {
            return res.status(HTTP_STATUS.Conflict).send(error.message);
        }
        return res.status(HTTP_STATUS.InternalServerError).send('Error while adding the question');
    }
};

export const deleteQuestion = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const deletedQuestions = await deleteQuestionFromDB(id);
        return res.json(deletedQuestions);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};

export const updateQuestion = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id;
        const questionData = req.body;
        const updatedQuestion = await updateQuestionFromDB(id, questionData);

        if (!updatedQuestion) {
            return res.status(HTTP_STATUS.NotFound).send('Question not found');
        }

        return res.status(HTTP_STATUS.Ok).json(updatedQuestion);
    } catch (error) {
        return res.sendStatus(HTTP_STATUS.BadRequest);
    }
};
