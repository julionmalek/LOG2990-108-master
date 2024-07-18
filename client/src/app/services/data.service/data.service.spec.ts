/* eslint-disable max-lines */
// We deemed a good idea to not split it in different parts.
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/question';
import { DataService } from './data.service';

describe('DataService', () => {
    let service: DataService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService],
        });
        service = TestBed.inject(DataService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateGameId should make GET request to validate a game ID', () => {
        const gameId = '1';
        const mockResponse = { isValid: true, message: 'Valid game ID' };

        service.validateGameId(gameId).subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/validate-game/${gameId}`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockResponse);
    });

    it('createGame should make POST request to create a new game', () => {
        const mockResponse = { gameId: '2' };

        service.createGame().subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockResponse);
            },
        });

        const req = httpTestingController.expectOne('http://localhost:3000/create-game');
        expect(req.request.method).toEqual('POST');
        req.flush(mockResponse);
    });

    it('deleteGameId should make DELETE request to delete a game ID', () => {
        const gameId = '1';
        const mockResponse = { message: 'Game ID deleted successfully' };

        service.deleteGameId(gameId).subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/delete-game/${gameId}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(mockResponse);
    });

    it('fetchQuiz should make GET request to fetch quizzes', () => {
        const mockQuizzes = [
            {
                id: '1',
                title: 'Test Quiz',
                description: 'Test Description',
                questions: [],
                hidden: false,
                duration: 20,
                lastModification: new Date(),
            },
        ];

        service.fetchQuiz().subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockQuizzes);
            },
        });

        const req = httpTestingController.expectOne('http://localhost:3000/quiz');
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuizzes);
    });

    it('fetchQuestions should make GET request to fetch questions', () => {
        const mockQuestions = [
            {
                type: 'QCM',
                id: '1',
                text: 'Test Question',
                choices: [],
                showChoices: true,
                points: 20,
                lastModification: new Date(),
            },
        ];

        service.fetchQuestions().subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockQuestions);
            },
        });

        const req = httpTestingController.expectOne('http://localhost:3000/questions');
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuestions);
    });

    it('fetchQuizById should make GET request to fetch a quiz by ID', () => {
        const mockQuiz = {
            id: '1',
            title: 'Test Quiz',
            description: 'Test Description',
            questions: [],
            hidden: false,
            duration: 20,
            lastModification: new Date(),
        };

        const quizId = '1';

        service.fetchQuizById(quizId).subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockQuiz);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/quiz/${quizId}`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuiz);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('deleteQuestion should make DELETE request to remove a question by ID', () => {
        const questionId = '1';
        const expectedResponse = {
            type: 'QCM',
            id: '1',
            text: 'Test Question',
            choices: [],
            showChoices: true,
            points: 20,
            lastModification: new Date(),
        };

        service.deleteQuestion(questionId).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/questions/${questionId}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(expectedResponse);
    });

    it('saveQuestion should make POST request to save a new question', () => {
        const newQuestionData = {
            type: 'QCM',
            text: 'New Question',
            choices: [
                {
                    text: 'Choice 1',
                    isCorrect: true,
                },
                {
                    text: 'Choice 2',
                    isCorrect: false,
                },
            ],
            points: 20,
            lastModification: new Date(),
        };
        const expectedResponse = {
            id: '2',
            ...newQuestionData,
            points: 20,
            lastModification: new Date(),
        };

        service.saveQuestion(newQuestionData).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne('http://localhost:3000/questions');
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(newQuestionData);
        req.flush(expectedResponse);
    });

    it('updateQuestion should make PATCH request to update an existing question', () => {
        const questionId = '1';
        const updateData = { text: 'Updated Question' };
        const expectedResponse = {
            type: 'QCM',
            id: questionId,
            ...updateData,
            choices: [],
            points: 20,
            lastModification: new Date(),
        };

        service.updateQuestion(questionId, updateData as Question).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/questions/${questionId}`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual(updateData);
        req.flush(expectedResponse);
    });

    it('saveQuiz should make POST request to save a new quiz', () => {
        const newQuizData = {
            title: 'New Quiz',
            description: 'New Description',
            questions: [],
            hidden: false,
            duration: 20,
            lastModification: new Date(),
        };
        const expectedResponse = {
            id: '2',
            ...newQuizData,
        };

        service.saveQuiz(newQuizData).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne('http://localhost:3000/quiz');
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(newQuizData);
        req.flush(expectedResponse);
    });

    it('updateQuiz should make PATCH request to update an existing quiz', () => {
        const quizId = '1';
        const updateData = { title: 'Updated Quiz' };
        const expectedResponse = {
            id: quizId,
            ...updateData,
            description: 'Test Description',
            questions: [],
            hidden: false,
            duration: 20,
            lastModification: new Date(),
        };

        service.updateQuiz(quizId, expectedResponse).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/quiz/${quizId}`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual(expectedResponse);
        req.flush(expectedResponse);
    });

    it('toggleQuizHidden should make PATCH request to toggle the hidden status of a quiz', () => {
        const quizId = '1';
        const hidden = false;
        const expectedResponse = {
            id: quizId,
            title: 'Test Quiz',
            description: 'Test Description',
            questions: [],
            hidden: true,
            duration: 20,
            lastModification: new Date(),
        };

        service.toggleQuizHidden(quizId, hidden).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/quiz/${quizId}`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual({ hidden: !hidden });
        req.flush(expectedResponse);
    });

    it('deleteQuiz should make DELETE request to remove a quiz by ID', () => {
        const quizId = '1';
        const expectedResponse = {
            id: quizId,
            title: 'Test Quiz',
            description: 'Test Description',
            questions: [],
            hidden: false,
            duration: 20,
            lastModification: new Date(),
        };

        service.deleteQuiz(quizId).subscribe({
            next: (response) => {
                expect(response.body).toEqual(expectedResponse);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/quiz/${quizId}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(expectedResponse);
    });

    /* it('exportQuiz should trigger download of a quiz', () => {
        const mockExportedQuiz: ExportedQuiz = {
            id: '1',
            title: 'Test Quiz',
            description: 'Test Description',
            questions: [],
            duration: 20,
            lastModification: new Date(),
        };
        const triggerDownloadSpy = spyOn(service, 'triggerDownload').and.callThrough();

        service.exportQuiz(mockExportedQuiz);

        expect(triggerDownloadSpy).toHaveBeenCalled();
    });*/

    it('validateQuestion should make POST request to validate a question', () => {
        const quizId = '1';
        const questionIndex = 0;
        const answerIndices = [1, 2];
        const mockFeedback = {
            pointsEarned: 50,
            firstAnswerBonus: true,
            correctAnswerIndices: [1, 2],
        };
        service.validateQuestion(quizId, questionIndex, answerIndices).subscribe({
            next: (response) => {
                expect(response.body).toEqual(mockFeedback);
            },
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/validate-question/${quizId}`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({ questionIndex, answerIndices });
        req.flush(mockFeedback);
    });

    it('preloadQuiz should make GET request to preload a quiz', () => {
        const quizId = '1';
        const preloadMessage = 'Quiz preloaded successfully';

        service.preloadQuiz(quizId).subscribe((data) => {
            expect(data).toEqual(preloadMessage);
        });

        const req = httpTestingController.expectOne(`http://localhost:3000/preload-quiz/${quizId}`);
        expect(req.request.method).toEqual('GET');
        req.flush(preloadMessage);
    });
});
