/* eslint-disable max-lines */
// We deemed a good idea to not split it in different parts.
import { Application } from '@app/app';
import { IQuestion, questionModel } from '@app/db/questions';
import * as quizModule from '@app/db/quizes';
import * as chai from 'chai';
import { expect } from 'chai';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('QuizController', () => {
    let mongoServer: MongoMemoryServer;
    let expressApp: express.Application;
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);
        await quizModule.quizModel.deleteMany({});
        await questionModel.deleteMany({});

        await quizModule.quizModel.create({
            _id: '65b6e2fe5ca1b992a5983bc5',
            title: 'testQuiz1',
            description: 'This is a description of test quiz 1',
            questions: [
                {
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
                        {
                            text: 'Pierre Elliott Trudeau',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f94',
                            id: '65ac2356062811c6230e4f94',
                        },
                    ],
                    points: 100,
                    _id: '65b700fe2c78104cc67898fc',
                    lastModification: '2024-01-29T01:35:58.744Z',
                },
            ],
            duration: 12,
            _v: 12,
            hidden: true,
            id: '65b6e2fe5ca1b992a5983bc5',
        });
        await quizModule.quizModel.create({
            _id: '65b198f84527051684034d17',
            title: 'testQuiz2',
            description: 'this is a description of test quiz 2',
            questions: [],
            duration: 30,
            hidden: false,
            _v: 0,
            id: '65b198f84527051684034d17',
        });
        await questionModel.create({
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
        await mongoose.disconnect();

        await mongoServer.stop();
    });

    it('getQuizzes should return all quizzes with status OK', async () => {
        return await supertest(expressApp)
            .get('/quiz')
            .expect(StatusCodes.OK)

            .then((response) => {
                chai.expect(response.body).to.be.an('array');

                response.body.forEach((quiz: quizModule.IQuiz) => {
                    chai.expect(quiz).to.include.keys(
                        'id',
                        'title',
                        'description',
                        'questions',
                        'duration',
                        'lastModification',
                        'hidden',
                        '__v',
                        '_id',
                    );
                    chai.expect(quiz.questions).to.be.an('array');
                });
            });
    });

    it('createQuiz should successfully create a quiz and return it with status CREATED', async () => {
        const newQuiz = {
            title: 'quiz1',
            description: 'This is the description of the quiz',
            questions: [
                {
                    type: 'QCM',
                    text: 'hello ?',
                    choices: [
                        {
                            text: 'Abraham Lincoln',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f81',
                        },
                        {
                            text: 'George Washington',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f82',
                        },
                        {
                            text: 'Thomas Jefferson',
                            isCorrect: true,
                            _id: '65ac2356062811c6230e4f83',
                        },
                        {
                            text: 'John Adams',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f84',
                        },
                    ],
                    lastModification: '2024-01-20T19:47:34.402Z',
                    points: 100,
                    _id: '65aed1c6105f610117a7728c',
                    _v: 0,
                },
            ],
            duration: 16,
        };

        return await supertest(expressApp)
            .post('/quiz')
            .send(newQuiz)
            .expect(StatusCodes.CREATED)
            .then((response) => {
                chai.expect(response.body).to.include.keys('id', 'title', 'description', 'questions', 'duration', 'hidden', '__v', '_id');
            });
    });

    it('createQuiz should not successfully create a quiz and return it when the duration value is not valid', async () => {
        const badQuiz = {
            title: 'quiz01',
            description: 'This is the description of the bad quiz',
            questions: [
                {
                    type: 'QCM',
                    text: 'hello ?',
                    choices: [
                        {
                            text: 'Abraham Lincoln',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f81',
                        },
                        {
                            text: 'George Washington',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f82',
                        },
                        {
                            text: 'Thomas Jefferson',
                            isCorrect: true,
                            _id: '65ac2356062811c6230e4f83',
                        },
                        {
                            text: 'John Adams',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f84',
                        },
                    ],
                    lastModification: '2024-01-20T19:47:34.402Z',
                    points: 100,
                    _id: '65aed1c6105f610117a7728c',
                    _v: 0,
                },
            ],
            duration: 61,
        };

        return await supertest(expressApp)
            .post('/quiz')
            .send(badQuiz)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.contain({});
            });
    });

    it('deleteQuiz should successfully delete a quiz and return the deleted quiz', async () => {
        const quizId = '65b198f84527051684034d17';

        return await supertest(expressApp)
            .delete(`/quiz/${quizId}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body.id).to.equal(quizId);
            });
    });

    it('updateQuiz should update a quiz successfully and return the updated quiz', async () => {
        const quizId = '65b6e2fe5ca1b992a5983bc5';
        const updatedData = {
            _id: '65b6e2fe5ca1b992a5983bc5',
            title: 'UpdatedTestQuiz1',
            description: 'This is a description of test quiz 1',
            questions: [
                {
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
                        {
                            text: 'Pierre Elliott Trudeau',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f94',
                            id: '65ac2356062811c6230e4f94',
                        },
                    ],
                    points: 100,
                    _id: '65b700fe2c78104cc67898fc',
                    lastModification: '2024-01-29T01:35:58.744Z',
                },
            ],
            duration: 12,
            _v: 12,
            hidden: true,
            id: '65b6e2fe5ca1b992a5983bc5',
        };

        return await supertest(expressApp)
            .patch(`/quiz/${quizId}`)
            .send(updatedData)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body.title).to.equal(updatedData.title);
            });
    });

    it('getQuizById should return a single quiz with the specified ID', async () => {
        const quizId = '65b6e2fe5ca1b992a5983bc5';

        return await supertest(expressApp)
            .get(`/quiz/${quizId}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.include.keys('id', 'title', 'description', 'questions', 'duration', 'hidden', '__v', '_id');

                chai.expect(response.body.id).to.equal(quizId);
            });
    });

    it('should reject non-integer values for points', async () => {
        const question: IQuestion = new questionModel({
            type: 'QCM',
            text: 'Test question',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 15,
        });

        try {
            await question.save();
        } catch (err) {
            expect(err.errors.points.message).to.equal("15 n'est pas valide. Doit être un multiple de 10 situé entre 10 et 100.");
        }
    });

    it('should reject values for points that are not multiples of 10', async () => {
        const question: IQuestion = new questionModel({
            type: 'QCM',
            text: 'Test question',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 25,
        });

        try {
            await question.save();
        } catch (err) {
            expect(err.errors.points.message).to.equal("25 n'est pas valide. Doit être un multiple de 10 situé entre 10 et 100.");
        }
    });

    it('should accept valid values for points', async () => {
        const question: IQuestion = new questionModel({
            type: 'QCM',
            text: 'Test question',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 20,
        });

        await question.save();
    });

    it('createQuiz should return a conflict status when a similar quiz already exists', async () => {
        const duplicateQuiz = {
            title: 'quiz1',
            description: 'This is the description of the quiz',
            questions: [
                {
                    type: 'QCM',
                    text: 'hello ?',
                    choices: [
                        {
                            text: 'Abraham Lincoln',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f81',
                        },
                        {
                            text: 'George Washington',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f82',
                        },
                        {
                            text: 'Thomas Jefferson',
                            isCorrect: true,
                            _id: '65ac2356062811c6230e4f83',
                        },
                        {
                            text: 'John Adams',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f84',
                        },
                    ],
                    lastModification: '2024-01-20T19:47:34.402Z',
                    points: 100,
                    _id: '65aed1c6105f610117a7728c',
                    _v: 0,
                },
            ],
            duration: 16,
        };
        await supertest(expressApp).post('/quiz').send(duplicateQuiz).expect(StatusCodes.CONFLICT); // Expecting a 409 Conflict response
    });

    it('deleteQuiz should return a bad request status when given an invalid quiz ID', async () => {
        const invalidQuizId = 'invalid-id';

        await supertest(expressApp).delete(`/quiz/${invalidQuizId}`).expect(StatusCodes.BAD_REQUEST); // Expecting a 400 Bad Request response
    });

    it('updateQuiz should return not found status when trying to update a non-existent quiz', async () => {
        const nonExistentQuizId = '65b6e2fe5ca1b992a5983bc1';

        const updateData = {
            title: 'Nonexistent Quiz',
        };

        await supertest(expressApp).patch(`/quiz/${nonExistentQuizId}`).send(updateData).expect(StatusCodes.NOT_FOUND);
    });

    it('updateQuiz should return a bad request status when not using correct id syntax', async () => {
        const validQuizId = 'nonexistentid';
        const invalidUpdateData = {};

        await supertest(expressApp).patch(`/quiz/${validQuizId}`).send(invalidUpdateData).expect(StatusCodes.BAD_REQUEST);
    });

    it('getQuizById should return not found status when the quiz does not exist', async () => {
        const nonExistentQuizId = '65b6e2fe5ca1b992a5983bc1';

        await supertest(expressApp).get(`/quiz/${nonExistentQuizId}`).expect(StatusCodes.NOT_FOUND);
    });

    it('getQuizById should return a bad request status when given an invalid quiz ID', async () => {
        const invalidQuizId = 'invalid-id';

        await supertest(expressApp).get(`/quiz/${invalidQuizId}`).expect(StatusCodes.BAD_REQUEST);
    });

    it('getQuizzes should return status BadRequest if an error occurs', async () => {
        const getAllQuizzesStub = sinon.stub(quizModule, 'getAllQuizzes').rejects(new Error('Simulated error'));
        Container.set('quizModule', { getAllQuizzes: getAllQuizzesStub });

        await supertest(expressApp).get('/quiz').expect(StatusCodes.BAD_REQUEST);

        getAllQuizzesStub.restore();
    });

    it('createQuiz should return InternalServerError if an error occurs', async () => {
        const newQuiz = {
            title: 'quiz1',
            description: 'This is the description of the quiz',
            questions: [
                {
                    type: 'QCM',
                    text: 'hello ?',
                    choices: [
                        {
                            text: 'Abraham Lincoln',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f81',
                        },
                        {
                            text: 'George Washington',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f82',
                        },
                        {
                            text: 'Thomas Jefferson',
                            isCorrect: true,
                            _id: '65ac2356062811c6230e4f83',
                        },
                        {
                            text: 'John Adams',
                            isCorrect: false,
                            _id: '65ac2356062811c6230e4f84',
                        },
                    ],
                    lastModification: '2024-01-20T19:47:34.402Z',
                    points: 100,
                    _id: '65aed1c6105f610117a7728c',
                    _v: 0,
                },
            ],
            duration: 16,
        };

        const addQuizStub = sinon.stub(quizModule, 'addQuiz').rejects(new Error('Simulated error'));
        Container.set('quizModule', { addQuiz: addQuizStub });

        await supertest(expressApp).post('/quiz').send(newQuiz).expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});
