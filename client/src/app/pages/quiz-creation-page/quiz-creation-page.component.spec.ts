/* eslint-disable @typescript-eslint/no-magic-numbers */
// We need to disable magic numbers here because it's a test file
/* eslint-disable max-lines */
// We deemed a good idea to not split it in different parts.
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { of, throwError } from 'rxjs';
import { QuizCreationPageComponent } from './quiz-creation-page.component';
describe('QuizCreationPageComponent', () => {
    const MULTIPLE_OF_FIVE = 5;
    const MAX_ANSWERS = 4;
    let component: QuizCreationPageComponent;
    let fixture: ComponentFixture<QuizCreationPageComponent>;
    let mockDataService: jasmine.SpyObj<DataService>;
    const mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
        url: '/create-quiz/modify-quiz/65b004d28aa297a064d51398',
    });
    let mockSnackBar: MatSnackBar;
    let mockQuiz: Quiz;

    beforeEach(async () => {
        mockQuiz = {
            id: '65b004d28aa297a064d51398',
            hidden: true,
            duration: 15,
            title: 'Mock Title',
            description: 'Mock Description',
            questions: [
                {
                    type: 'QCM',
                    id: '62a23958e5a9e9b88f853a67',
                    text: 'Example question?',
                    showChoices: true,
                    choices: [
                        { id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false },
                        { id: '65ac2356062811c6230e4f93', text: 'mock text2', isCorrect: true },
                    ],
                    points: 0,
                    lastModification: new Date(),
                },
                {
                    type: 'QCM',
                    id: '62a23958e5a9e9b88f853a68',
                    text: 'Example question?',
                    showChoices: true,
                    choices: [
                        { id: '65ac2356062811c6230e4f8', text: 'mock text3', isCorrect: true },
                        { id: '65ac2356062811c6230e4f9', text: 'mock text4', isCorrect: false },
                    ],
                    points: 0,
                    lastModification: new Date(),
                },
            ],
            lastModification: new Date(),
        };
        mockDataService = jasmine.createSpyObj('DataService', ['fetchQuizById', 'saveQuiz', 'updateQuiz', 'saveQuestion']);
        mockDataService.fetchQuizById.and.returnValue(
            of(
                new HttpResponse({
                    body: mockQuiz,
                    status: 200,
                }),
            ),
        );

        await TestBed.configureTestingModule({
            declarations: [QuizCreationPageComponent],
            imports: [MatMenuModule, HttpClientTestingModule, MatSnackBarModule, ReactiveFormsModule, NoopAnimationsModule],
            providers: [FormBuilder, { provide: DataService, useValue: mockDataService }, { provide: Router, useValue: mockRouter }, MatSnackBar],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(QuizCreationPageComponent);
        component = fixture.componentInstance;
        mockSnackBar = TestBed.inject(MatSnackBar);
        if (!mockRouter.navigate.calls) {
            spyOn(mockRouter, 'navigate');
        }
        spyOn(mockSnackBar, 'open');
        component.ngOnInit();
    });

    afterEach(() => {
        mockRouter.navigate.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle errors on ngOnInit', () => {
        mockDataService.fetchQuizById.and.returnValue(throwError(() => new Error('Not found')));
        component.ngOnInit();
        expect(mockSnackBar.open).toHaveBeenCalledWith('Erreur lors du chargement du quiz. Veuillez reessayer plus tard.', '', { duration: 5000 });
    });

    it('should load a quiz for editing if modify-quiz route is detected', () => {
        const quizId = '65b004d28aa297a064d51398';
        mockRouter.url = `/create-quiz/modify-quiz/${quizId}`;
        const mockResponse = new HttpResponse({
            body: mockQuiz,
            status: 200,
        });

        mockDataService.fetchQuizById.and.returnValue(of(mockResponse));

        component.ngOnInit();

        expect(mockDataService.fetchQuizById).toHaveBeenCalledWith(quizId);
        if (mockResponse.body) {
            expect(component.form.value.title).toEqual(mockResponse.body.title);
            expect(component.questions.length).toEqual(mockResponse.body.questions.length);
        } else {
            fail('HttpResponse body is null');
        }
    });

    describe('importQuiz', () => {
        it('should correctly import and parse a quiz file', () => {
            const testFile = new Blob(
                [
                    JSON.stringify({
                        questions: [{ text: 'Example question?', choices: [{ text: 'Answer 1', isCorrect: true }] }],
                    }),
                ],
                { type: 'application/json' },
            );

            const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsText', 'onload']);
            spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);
            const event = {
                target: {
                    files: [testFile],
                },
            } as unknown as Event;
            spyOn(JSON, 'parse').and.returnValue(mockQuiz);
            spyOn(component.form, 'patchValue');
            const mockFormArray = new FormArray([]);
            spyOn(component.form, 'get').and.returnValue(mockFormArray);
            spyOn(mockFormArray, 'clear');
            spyOn(mockFormArray, 'push');
            component.importQuiz(event);
            const result = { target: { result: fileReaderSpy.readAsText.calls.argsFor(0)[0] } };
            fileReaderSpy.onload(result);

            expect(fileReaderSpy.readAsText).toHaveBeenCalledWith(testFile);
            expect(JSON.parse).toHaveBeenCalled();
            expect(component.form.get).toHaveBeenCalled();
            expect(mockFormArray.push).toHaveBeenCalledTimes(mockQuiz.questions.length);
            expect(component.form.patchValue).toHaveBeenCalled();
        });

        it('should be able to handle error on importQuiz', () => {
            const testFile = new Blob(
                [
                    JSON.stringify({
                        questions: [{ text: 'Example question?', choices: [{ text: 'Answer 1', isCorrect: true }] }],
                    }),
                ],
                { type: 'application/json' },
            );

            const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsText', 'onload']);
            spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);
            const event = {
                target: {
                    files: [testFile],
                },
            } as unknown as Event;

            component.importQuiz(event);
            const result = { target: { result: fileReaderSpy.readAsText.calls.argsFor(0)[0] } };
            fileReaderSpy.onload(result);

            expect(fileReaderSpy.readAsText).toHaveBeenCalledWith(testFile);
            expect(mockSnackBar.open).toHaveBeenCalled();
        });
    });
    describe('getChoices', () => {
        it('should return the choices form array of a question', () => {
            component.createForm();
            const choices = component.getChoices(component.questions.at(0));

            expect(choices).toBeInstanceOf(FormArray);
            expect(choices.length).toEqual(2);
        });
    });

    describe('createForm', () => {
        it('should create the form with default values', () => {
            component.createForm();

            expect(component.form.get('title')?.value).toEqual('');
            expect(component.form.get('description')?.value).toEqual('');
            expect(component.form.get('hidden')?.value).toEqual(true);
            expect(component.form.get('duration')?.value).toEqual('');
            expect(component.form.get('questions')).toBeInstanceOf(FormArray);
            expect((component.form.get('questions') as FormArray).length).toEqual(1);
        });
    });

    describe('createQuestion', () => {
        it('should create a new question form group with default values', () => {
            const question = component.createQuestion();

            expect(question.get('text')?.value).toEqual('');
            expect(question.get('points')?.value).toEqual('');
            expect(question.get('choices')).toBeInstanceOf(FormArray);
            expect((question.get('choices') as FormArray).length).toEqual(2);
        });

        it('should create a new question form group with provided values', () => {
            const questionData = {
                type: 'QCM',
                id: '62a23958e5a9e9b88f853a67',
                text: 'Sample Question',
                showChoices: true,
                choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                points: 10,
                lastModification: new Date(),
            };

            const question = component.createQuestion(questionData);

            expect(question.get('text')?.value).toEqual('Sample Question');
            expect(question.get('points')?.value).toEqual(questionData.points);
            expect(question.get('choices')).toBeInstanceOf(FormArray);
            expect((question.get('choices') as FormArray).length).toEqual(1);
        });
    });

    describe('addQuestion', () => {
        it('should add a new question to the form', () => {
            component.createForm();
            component.addQuestion();

            expect(component.questions.length).toEqual(2);
        });
    });

    describe('deleteQuestion', () => {
        it('should delete the question at the specified index', () => {
            component.createForm();
            component.addQuestion();
            component.deleteQuestion(1);

            expect(component.questions.length).toEqual(1);
        });
    });

    describe('loadQuestionFromBank', () => {
        let selectedQuestion: Question;
        let mockSelectorRef: jasmine.SpyObj<MatDialogRef<unknown>>;
        let mockMatDialog: jasmine.SpyObj<MatDialog>;
        beforeEach(() => {
            selectedQuestion = {
                id: 'some-id',
                type: 'QCM',
                text: 'Sample Question',
                showChoices: true,
                choices: [
                    { id: '1', text: 'Choice 1', isCorrect: true },
                    { id: '2', text: 'Choice 2', isCorrect: false },
                ],
                points: 10,
                lastModification: new Date(),
            };

            jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
            mockSelectorRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            mockMatDialog.open.and.returnValue(mockSelectorRef);
        });
        it('should load a question from the bank and add it to the list of questions', fakeAsync(() => {
            mockSelectorRef.afterClosed.and.returnValue(of(selectedQuestion));

            spyOn(component['injector'], 'get').and.returnValue(mockMatDialog);
            spyOn(component.questions, 'push');
            spyOn(component, 'createQuestion');

            component.loadQuestionFromBank();
            tick();

            expect(component.questions.push).toHaveBeenCalledWith(component.createQuestion(selectedQuestion));
            expect(component.createQuestion).toHaveBeenCalledWith(selectedQuestion);
        }));

        it('should not add a question if no question is selected from the bank', fakeAsync(() => {
            mockSelectorRef.afterClosed.and.returnValue(of(null)); // Simulating no question selected

            spyOn(component['injector'], 'get').and.returnValue(mockMatDialog);
            spyOn(component.questions, 'push');

            component.loadQuestionFromBank();
            tick();

            expect(component.questions.push).not.toHaveBeenCalled();
        }));
    });

    describe('saveQuestionToBank', () => {
        it('should save a question to the bank', () => {
            spyOn(component.questions, 'at').and.returnValue({ valid: true, value: { text: 'mock-value' } } as AbstractControl);
            const mockResponse = new HttpResponse<Question>({ body: mockQuiz.questions[0], status: 200 });
            mockDataService.saveQuestion.and.returnValue(of(mockResponse));
            spyOn(component['injector'], 'get').and.returnValue(mockSnackBar);
            component.saveQuestionToBank(0);
            expect(component['injector'].get(MatSnackBar).open).toHaveBeenCalledWith(
                `La question ${'mock-value'} a été ajoutée à la banque de question avec succès.`,
                '',
                {
                    duration: 5000,
                },
            );
        });

        it('should not save a question to the bank if the form is invalid', () => {
            spyOn(component.questions, 'at').and.returnValue({ valid: false, value: { text: 'mock-value' } } as AbstractControl);
            component.saveQuestionToBank(0);
            expect(component['injector'].get(MatSnackBar).open).not.toHaveBeenCalled();
        });

        it('should be able to handle errors', () => {
            spyOn(component.questions, 'at').and.returnValue({ valid: true, value: { text: 'mock-value' } } as AbstractControl);
            const errorResponse = new HttpErrorResponse({
                status: 400,
                statusText: 'Bad Request',
                error: 'Bad Request',
            });

            mockDataService.saveQuestion.and.returnValue(throwError(() => errorResponse));
            spyOn(component['injector'], 'get').and.returnValue(mockSnackBar);
            component.saveQuestionToBank(0);
            expect(component['injector'].get(MatSnackBar).open).toHaveBeenCalledWith('Bad Request', '', {
                duration: 5000,
                panelClass: ['warn-snackbar'],
            });
        });
    });

    describe('createChoice', () => {
        it('should create a new choice form group with default values', () => {
            const choice = component.createChoice();

            expect(choice.get('text')?.value).toEqual('');
            expect(choice.get('isCorrect')?.value).toEqual(false);
        });

        it('should create a new choice form group with provided values', () => {
            const choiceData = { text: 'Sample Choice', isCorrect: true };
            const choice = component.createChoice(choiceData);

            expect(choice.get('text')?.value).toEqual('Sample Choice');
            expect(choice.get('isCorrect')?.value).toEqual(true);
        });
    });

    describe('addChoice', () => {
        it('should add a new choice to the specified question', () => {
            component.createForm();
            component.addChoice(0);

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.length).toEqual(3);
        });

        it('should not add a new choice if the maximum limit is reached', () => {
            component.createForm();
            component.addChoice(0);
            component.addChoice(0);
            component.addChoice(0);

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.length).toEqual(MAX_ANSWERS);
        });
    });

    describe('removeChoice', () => {
        it('should remove the choice at the specified index of the specified question', () => {
            component.createForm();
            component.addChoice(0);
            component.removeChoice(0, 0);

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.length).toEqual(2);
        });

        it('should not remove the choice if the minimum limit is reached', () => {
            component.createForm();
            component.removeChoice(0, 0);

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.length).toEqual(2);
        });
    });

    describe('moveChoice', () => {
        it('should move the choice at the specified index of the specified question up', () => {
            component.createForm();

            component.addChoice(0);
            component.addChoice(0);
            component.moveChoice(0, 1, 'up');

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.controls[0].get('text')?.value).toEqual('');
            expect(choices.controls[1].get('text')?.value).toEqual('');
        });

        it('should move the choice at the specified index of the specified question down', () => {
            component.createForm();
            component.addChoice(0);
            component.addChoice(0);
            component.moveChoice(0, 0, 'down');

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.controls[0].get('text')?.value).toEqual('');
            expect(choices.controls[1].get('text')?.value).toEqual('');
        });

        it('should not move the choice if the new index is out of bounds', () => {
            component.createForm();
            component.addChoice(0);
            component.addChoice(0);
            component.moveChoice(0, 1, 'up');

            const choices = component.getChoices(component.questions.at(0));
            expect(choices.controls[0].get('text')?.value).toEqual('');
            expect(choices.controls[1].get('text')?.value).toEqual('');
        });
    });

    describe('createQuiz', () => {
        let formData: Quiz;
        beforeEach(() => {
            formData = {
                id: 'some-id',
                hidden: false,
                duration: 10,
                title: 'Sample Quiz',
                description: 'Sample Description',
                questions: [],
                lastModification: new Date(),
            };
        });
        it('should save a new quiz successfully', fakeAsync(() => {
            const mockResponse = new HttpResponse({ status: 200, body: formData });

            mockDataService.saveQuiz.and.returnValue(of(mockResponse));
            component.createQuiz(formData);
            tick();

            expect(mockDataService.saveQuiz).toHaveBeenCalledWith(formData);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/vue-admin']);
            expect(mockSnackBar.open).toHaveBeenCalledWith(`Le quiz ${formData.title} a été sauvegardé avec succès.`, '', {
                duration: 5000,
            });
        }));

        it('should handle error when saving a new quiz', fakeAsync(() => {
            const errorResponse = new HttpErrorResponse({
                status: 400,
                statusText: 'Bad Request',
                error: 'Bad Request',
            });

            mockDataService.saveQuiz.and.returnValue(throwError(() => errorResponse));
            component.createQuiz(formData);
            tick();

            // Assert
            expect(mockDataService.saveQuiz).toHaveBeenCalledWith(formData);
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            expect(mockSnackBar.open).toHaveBeenCalledWith('Bad Request', '', {
                duration: 5000,
                panelClass: ['warn-snackbar'],
            });
        }));
    });

    describe('modifyQuiz', () => {
        it('should call updateQuiz on DataService and navigate on success', fakeAsync(() => {
            const formData: Quiz = {
                id: 'some-id',
                hidden: false,
                duration: 30,
                title: 'Sample Quiz',
                description: 'Sample Description',
                questions: [],
                lastModification: new Date(),
            };

            const quizId = '12345';

            mockDataService.updateQuiz.and.returnValue(of(new HttpResponse({ status: 200, body: formData })));

            component.modifyQuiz(formData, quizId);
            tick();

            expect(mockDataService.updateQuiz).toHaveBeenCalledWith(quizId, formData);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/vue-admin']);
            expect(mockSnackBar.open).toHaveBeenCalledWith('Le quiz Sample Quiz a été modifié avec succès.', '', {
                duration: 5000,
            });
        }));

        it('should handle error correctly when quiz modification fails with an error other than NotFound', fakeAsync(() => {
            const formData: Quiz = {
                id: 'some-id',
                title: 'Failing Quiz',
                description: 'This should fail',
                hidden: true,
                duration: 10,
                questions: [],
                lastModification: new Date(),
            };

            const errorResponse = new HttpErrorResponse({
                status: 400,
                statusText: 'Bad Request',
                error: 'Bad Request',
            });
            mockDataService.updateQuiz.and.returnValue(throwError(() => errorResponse));

            component.modifyQuiz(formData, 'some-id');
            tick();

            expect(mockSnackBar.open).toHaveBeenCalledWith('Bad Request', '', { duration: 5000, panelClass: ['warn-snackbar'] });
        }));

        it('should create a new quiz if quiz modification fails with NotFound error', fakeAsync(() => {
            const formData: Quiz = {
                id: 'not-found-id',
                title: 'New Quiz',
                description: 'This quiz does not exist and should be created',
                hidden: true,
                duration: 10,
                questions: [],
                lastModification: new Date(),
            };

            const notFoundError = new HttpErrorResponse({
                status: 404,
                statusText: 'Not Found',
                error: 'Not Found',
            });
            mockDataService.updateQuiz.and.returnValue(throwError(() => notFoundError));
            mockDataService.saveQuiz.and.returnValue(of(new HttpResponse({ status: 200, body: formData })));
            spyOn(component, 'createQuiz');
            component.modifyQuiz(formData, 'not-found-id');
            tick();
            expect(component.createQuiz).toHaveBeenCalled();
        }));
    });

    describe('submitForm', () => {
        beforeEach(() => {
            spyOn(component, 'modifyQuiz');
            spyOn(component, 'createQuiz');
        });
        it('should call modifyQuiz if in the url is modify-quiz', () => {
            component.form = { valid: true, value: { title: 'Sample Title' } as Quiz } as FormGroup;
            spyOn(component['injector'], 'get').and.returnValue({ url: 'link/quiz/modify-quiz/1235' });
            component.submitForm();
            expect(component.modifyQuiz).toHaveBeenCalledWith({ title: 'Sample Title' } as Quiz, '1235');
            expect(component.createQuiz).not.toHaveBeenCalled();
        });

        it('should call createQuiz if in the url is not modify-quiz', () => {
            component.form = { valid: true, value: { title: 'Sample Title' } as Quiz } as FormGroup;
            spyOn(component['injector'], 'get').and.returnValue({ url: 'link/quiz/create-quiz/1235' });
            component.submitForm();
            expect(component.modifyQuiz).not.toHaveBeenCalled();
            expect(component.createQuiz).toHaveBeenCalledWith({ title: 'Sample Title' } as Quiz);
        });

        it('should do nothing if the form is invalid', () => {
            component.submitForm();
            component.form = { valid: false } as FormGroup;
            expect(component.modifyQuiz).not.toHaveBeenCalled();
            expect(component.createQuiz).not.toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should call Router.navigate', () => {
            const mockInjectRouter = { navigate: jasmine.createSpy() } as jasmine.SpyObj<Router>;
            spyOn(component['injector'], 'get').and.returnValue(mockInjectRouter);
            component.cancel();
            expect(mockInjectRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('drop', () => {
        it('should rearrange the questions', () => {
            component.createForm();
            component.addQuestion();
            component.addQuestion();
            const event = {
                previousIndex: 0,
                currentIndex: 2,
            } as CdkDragDrop<string[]>;
            component.drop(event);
            const questions = component.form.get('questions') as FormArray;
            expect(questions.controls[2].get('text')?.value).toEqual('');
        });
    });

    describe('getErrorDescription', () => {
        it('should return the correct error message', () => {
            component.createForm();
            const control = component.form.get('title');
            control?.setErrors({ required: true });
            expect(component.getErrorDescription(['title'])).toEqual('Ce champ ne peut pas être vide.');
            control?.setErrors({ invalidChoices: true });
            expect(component.getErrorDescription(['title'])).toEqual('La question doit contenir au moins une bonne et une mauvaise réponse.');
            control?.setErrors({ min: { min: 5 } });
            expect(component.getErrorDescription(['title'])).toEqual('La valeur minimale est 5.');
            control?.setErrors({ max: { max: 10 } });
            expect(component.getErrorDescription(['title'])).toEqual('La valeur maximale est 10.');
            control?.setErrors({ notMultipleOf: { multiple: 3 } });
            expect(component.getErrorDescription(['title'])).toEqual('La valeur doit être un multiple de 3');

            control?.setErrors(null);
            expect(component.getErrorDescription(['title'])).toEqual('');

            expect(component.getErrorDescription([])).toEqual('');
        });
    });

    describe('hasCorrectAndIncorrectChoice', () => {
        it('should return null if the question has at least one correct and one incorrect choice', () => {
            const question = component.createQuestion();
            const choices = component.getChoices(question);

            choices.at(0).get('isCorrect')?.setValue(true);
            choices.at(1).get('isCorrect')?.setValue(false);

            const result = component.hasCorrectAndIncorrectChoice()(question);

            expect(result).toBeNull();
        });

        it('should return an error object if the question does not have both correct and incorrect choices', () => {
            const question = component.createQuestion();
            const choices = component.getChoices(question);

            choices.at(0).get('isCorrect')?.setValue(true);
            choices.at(1).get('isCorrect')?.setValue(true);
            const result = component.hasCorrectAndIncorrectChoice()(question);

            expect(result).toBeNull();
        });

        it('should return null if the control is not a FormArray', () => {
            const control = {} as AbstractControl;
            const result = component.hasCorrectAndIncorrectChoice()(control);

            expect(result).toBeNull();
        });
    });

    describe('multipleOf', () => {
        it('should return null if the value is a multiple of the specified number', () => {
            const control = { value: 10 } as AbstractControl;
            const result = component.multipleOf(MULTIPLE_OF_FIVE)(control);

            expect(result).toBeNull();
        });

        it('should return an error object if the value is not a multiple of the specified number', () => {
            const control = { value: 7 } as AbstractControl;
            const result = component.multipleOf(MULTIPLE_OF_FIVE)(control);

            expect(result).toEqual({ notMultipleOf: { multiple: MULTIPLE_OF_FIVE } });
        });

        it('should return null if the value is null or empty', () => {
            const control1 = { value: null } as AbstractControl;
            const control2 = { value: '' } as AbstractControl;
            const result1 = component.multipleOf(MULTIPLE_OF_FIVE)(control1);
            const result2 = component.multipleOf(MULTIPLE_OF_FIVE)(control2);

            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });
    });

    describe('questionDirty', () => {
        it('should return true if a question has been changed', () => {
            spyOn(component, 'getChoices').and.returnValue({
                controls: [{ dirty: true }, { dirty: false }, { dirty: false }] as AbstractControl[],
            } as FormArray);
            expect(component.questionDirty(0)).toEqual(true);
        });

        it('should return false if no questions have been changed', () => {
            spyOn(component, 'getChoices').and.returnValue({
                controls: [{ dirty: false }, { dirty: false }, { dirty: false }] as AbstractControl[],
            } as FormArray);
            expect(component.questionDirty(0)).toEqual(false);
        });
    });
});
