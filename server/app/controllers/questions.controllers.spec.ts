import { Application } from '@app/app'; // Adjust import paths as needed
import * as questionService from '@app/db/questions'; // Adjust import paths as needed
import * as chai from 'chai';
import * as express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { HTTP_STATUS } from 'utilities/constants'; // Adjust import paths as needed
const expect = chai.expect;

describe('QuestionsController', () => {
    let mongoServer: MongoMemoryServer;
    let expressApp: express.Application;

    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);
        await questionService.questionModel.deleteMany({});

        await questionService.questionModel.create({
            type: 'QCM',
            text: 'Who was the first prime minister of Canada',
            choices: [
                {
                    text: 'John A McDonald',
                    isCorrect: true,
                    _id: '65ac2356062811c6230e4f82',
                    id: '65ac2356062811c6230e4f82',
                },
                {
                    text: 'Sir Wilfred Laurier',
                    isCorrect: false,
                    _id: '65ac2356062811c6230e4f83',
                    id: '65ac2356062811c6230e4f83',
                },
            ],
            points: 100,
            _id: '65b700fe2c78104cc67898fd',
            lastModification: '2024-01-29T01:35:58.744Z',
        });

        await questionService.questionModel.create({
            type: 'QCM',
            text: 'Who was the first prime minister of Canada',
            choices: [
                {
                    text: 'John A McDonald',
                    isCorrect: true,
                    _id: '65ac2356062811c6230e4f92',
                    id: '65ac2356062811c6230e4f92',
                },
                {
                    text: 'Sir Wilfred Laurier',
                    isCorrect: false,
                    _id: '65ac2356062811c6230e4f93',
                    id: '65ac2356062811c6230e4f93',
                },
            ],
            points: 100,
            _id: '65b700fe2c78104cc67898fe',
            lastModification: '2024-01-29T01:35:58.744Z',
        });
        const app = Container.get(Application);
        expressApp = app.app;
    });

    after(async () => {
        // Disconnect your mongoose client
        await mongoose.disconnect();

        // Stop the in-memory MongoDB server
        await mongoServer.stop();
    });

    it('getQuestions should return all questions with status OK', async () => {
        await supertest(expressApp)
            .get('/questions') // Adjust endpoint as necessary
            .expect(HTTP_STATUS.Ok)
            .then((response) => {
                expect(response.body).to.be.an('array');
                // Additional checks for the questions structure can be performed here
            });
    });

    it('createQuestion should successfully create a question and return it with status CREATED', async () => {
        const newQuestion = {
            type: 'QCM',
            text: 'New Question',
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: true },
            ],
            points: 100,
            lastModification: '2024-01-29T01:35:58.744Z',
        };

        await supertest(expressApp)
            .post('/questions') // Adjust endpoint as necessary
            .send(newQuestion)
            .expect(HTTP_STATUS.Created)
            .then((response) => {
                expect(response.body).to.include.keys('text', 'choices', 'type');
            });
    });

    it('updateQuestion should update a question successfully and return the updated question', async () => {
        const questionId = '65b700fe2c78104cc67898fe';
        const updatedQuestionData = {
            type: 'QCM',
            text: 'updated title',
            choices: [
                {
                    text: 'John A McDonald',
                    isCorrect: true,
                    _id: '65ac2356062811c6230e4f92',
                    id: '65ac2356062811c6230e4f92',
                },
                {
                    text: 'Sir Wilfred Laurier',
                    isCorrect: false,
                    _id: '65ac2356062811c6230e4f93',
                    id: '65ac2356062811c6230e4f93',
                },
            ],
            points: 100,
            _id: '65b700fe2c78104cc67898fe',
            lastModification: '2024-01-29T01:35:58.744Z',
        };

        await supertest(expressApp).patch(`/questions/${questionId}`).send(updatedQuestionData).expect(HTTP_STATUS.Ok);
    });

    it('deleteQuestion should successfully delete a question and return the deleted question', async () => {
        const questionId = '65b700fe2c78104cc67898fe';

        await supertest(expressApp).delete(`/questions/${questionId}`).expect(HTTP_STATUS.Ok);
    });

    it('deleteQuestion should return status BadRequest if the question does not exist', async () => {
        const questionId = 'invalid-id';

        await supertest(expressApp).delete(`/questions/${questionId}`).expect(HTTP_STATUS.BadRequest);
    });

    it('updateQuestion should return status BadRequest if the question does not exist', async () => {
        const questionId = 'invalid-id';
        const updatedQuestionData = {
            type: 'QCM',
            text: 'updated title',
            choices: [
                {
                    text: 'John A McDonald',
                    isCorrect: true,
                    _id: '65ac2356062811c6230e4f92',
                    id: '65ac2356062811c6230e4f92',
                },
                {
                    text: 'Sir Wilfred Laurier',
                    isCorrect: false,
                    _id: '65ac2356062811c6230e4f93',
                    id: '65ac2356062811c6230e4f93',
                },
            ],
            points: 100,
            _id: '65b700fe2c78104cc67898fe',
            lastModification: '2024-01-29T01:35:58.744Z',
        };

        await supertest(expressApp).patch(`/questions/${questionId}`).send(updatedQuestionData).expect(HTTP_STATUS.BadRequest);
    });

    it('createQuestion should return status Conflict if the question already exists', async () => {
        const newQuestion = {
            type: 'QCM',
            text: 'Who was the first prime minister of Canada',
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: true },
            ],
            points: 100,
            lastModification: '2024-01-29T01:35:58.744Z',
        };

        await supertest(expressApp).post('/questions').send(newQuestion).expect(HTTP_STATUS.Conflict);
    });

    it('updatedQuestion should return status NotFound if the question does not exist', async () => {
        const questionId = '65b700fe2c78104cc67898fe';
        const updatedQuestionData = {
            type: 'QCM',
            text: 'updated title',
            choices: [
                {
                    text: 'John A McDonald',
                    isCorrect: true,
                    _id: '65ac2356062811c6230e4f92',
                    id: '65ac2356062811c6230e4f92',
                },
                {
                    text: 'Sir Wilfred Laurier',
                    isCorrect: false,
                    _id: '65ac2356062811c6230e4f93',
                    id: '65ac2356062811c6230e4f93',
                },
            ],
            points: 100,
            _id: '65b700fe2c78104cc67898fe',
            lastModification: '2024-01-29T01:35:58.744Z',
        };

        await supertest(expressApp).patch(`/questions/${questionId}`).send(updatedQuestionData).expect(HTTP_STATUS.NotFound);
    });

    it('getQuestions should return status BadRequest if an error occurs', async () => {
        const getAllQuestionsStub = sinon.stub(questionService, 'getAllQuestions').rejects(new Error('Simulated error'));
        Container.set('questionService', { getAllQuestions: getAllQuestionsStub });

        await supertest(expressApp).get('/questions').expect(HTTP_STATUS.BadRequest);

        getAllQuestionsStub.restore();
    });

    it('createQuestion should return status InternalServerError if an error occurs', async () => {
        const addQuestionStub = sinon.stub(questionService, 'addQuestion').rejects(new Error('Simulated error'));
        Container.set('questionService', { addQuestion: addQuestionStub });

        await supertest(expressApp).post('/questions').send({}).expect(HTTP_STATUS.InternalServerError);

        addQuestionStub.restore();
    });
});
