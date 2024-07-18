/* eslint-disable max-lines */
// Since it's a test file, we deemed a good idea to not split it in different parts.
import { HttpResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Question } from '@app/interfaces/question';
import { DataService } from '@app/services/data.service/data.service';
import { SharedService } from '@app/services/shared.service/shared.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { QuestionFormComponent } from './question-form.component';

describe('QuestionFormComponent', () => {
    let currentQuestionSubject: BehaviorSubject<Question | null>;
    let component: QuestionFormComponent;
    let fixture: ComponentFixture<QuestionFormComponent>;
    let routerMock: { navigate: jasmine.Spy };
    let dataServiceMock: jasmine.SpyObj<DataService>;
    let sharedServiceMock: SharedService;
    let snackBar: MatSnackBar;

    const mockQuestion: Question = {
        type: 'QCM',
        id: '1',
        text: 'Sample Question',
        choices: [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ],
        points: 20,
        lastModification: new Date(),
    };

    beforeEach(async () => {
        dataServiceMock = jasmine.createSpyObj('DataService', ['saveQuestion', 'updateQuestion', 'fetchQuestions']);
        if (dataServiceMock.saveQuestion.calls.any()) {
            dataServiceMock.saveQuestion.calls.reset();
        }
        currentQuestionSubject = new BehaviorSubject<Question | null>(mockQuestion);

        sharedServiceMock = {
            currentQuestion: currentQuestionSubject.asObservable(),
        } as SharedService;

        const mockQuestionResponse = new HttpResponse({ body: mockQuestion });
        dataServiceMock.saveQuestion.and.returnValue(of(mockQuestionResponse));
        dataServiceMock.updateQuestion.and.returnValue(of(mockQuestionResponse));
        routerMock = {
            navigate: jasmine.createSpy('navigate'),
        };

        const questionsResponse: HttpResponse<Question[]> = new HttpResponse({
            body: [],
        });
        dataServiceMock.fetchQuestions.and.returnValue(of(questionsResponse));

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                MatDialogModule,
                MatSnackBarModule,
                RouterTestingModule.withRoutes([{ path: 'vue-admin', redirectTo: '' }]),
                NoopAnimationsModule,
            ],
            declarations: [QuestionFormComponent],
            providers: [
                FormBuilder,
                MatSnackBar,
                MatDialog,
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: DataService, useValue: dataServiceMock },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({ newQuestion: 'true' }),
                    },
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionFormComponent);
        component = fixture.componentInstance;
        spyOn(component, 'loadQuestion').and.callThrough();
        component.questionForm = new FormBuilder().group({});
        snackBar = TestBed.inject(MatSnackBar);
        fixture.detectChanges();
    });

    it('should call loadQuestion when a question is emitted by sharedService', fakeAsync(() => {
        const emittedQuestion: Question = {
            type: 'QCM',
            id: 'unique-id',
            text: 'Emitted Question Text',
            choices: [
                { text: 'Emitted Choice 1', isCorrect: true },
                { text: 'Emitted Choice 2', isCorrect: false },
            ],
            points: 30,
            lastModification: new Date(),
        };

        currentQuestionSubject.next(emittedQuestion);

        fixture.detectChanges();
        tick();

        expect(component.loadQuestion).toHaveBeenCalledWith(
            jasmine.objectContaining({
                id: 'unique-id',
                text: 'Emitted Question Text',
                choices: jasmine.any(Array),
                points: 30,
                lastModification: jasmine.any(Date),
            }),
        );
    }));

    it('should display a message when no choices are added', fakeAsync(() => {
        spyOn(snackBar, 'open');

        component.choices.clear();
        component.saveForm();
        tick();
        expect(snackBar.open).toHaveBeenCalledWith('Veuillez ajouter au moins un choix.', 'Fermer', jasmine.any(Object));
        flush();
    }));

    it('should correctly update component state when loadQuestion is called with a question', fakeAsync(() => {
        const mockQuestionToLoad: Question = {
            type: 'QCM',
            id: '3',
            text: 'Directly Loaded Question',
            choices: [
                { text: 'Direct Choice 1', isCorrect: true },
                { text: 'Direct Choice 2', isCorrect: false },
            ],
            points: 40,
            lastModification: new Date(),
        };

        component.loadQuestion(mockQuestionToLoad);

        expect(component.questionForm.value.text).toEqual(mockQuestionToLoad.text);
        expect(component.questionForm.value.choices.length).toEqual(mockQuestionToLoad.choices.length);
        expect(component.questionForm.value.points).toEqual(mockQuestionToLoad.points);

        mockQuestionToLoad.choices.forEach((choice, index) => {
            expect(component.questionForm.value.choices[index].text).toEqual(choice.text);
        });
    }));

    it('should correctly update component state when loadQuestion is called with a question that has no id', fakeAsync(() => {
        const mockQuestionToLoad: Question = {
            type: 'QCM',
            text: 'Directly Loaded Question',
            choices: [
                { text: 'Direct Choice 1', isCorrect: true },
                { text: 'Direct Choice 2', isCorrect: false },
            ],
            points: 40,
            lastModification: new Date(),
        };

        component.loadQuestion(mockQuestionToLoad);

        expect(component.questionForm.value.text).toEqual(mockQuestionToLoad.text);
        expect(component.questionForm.value.choices.length).toEqual(mockQuestionToLoad.choices.length);
        expect(component.questionForm.value.points).toEqual(mockQuestionToLoad.points);
        expect(component.questionForm.value.id).toBe(undefined);
        mockQuestionToLoad.choices.forEach((choice, index) => {
            expect(component.questionForm.value.choices[index].text).toEqual(choice.text);
        });
    }));
    it('should show a snackbar message when a question with the same title already exists', () => {
        spyOn(snackBar, 'open');
        const existingQuestion: Question = {
            type: 'QCM',
            id: '1',
            text: 'Existing Question',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 20,
            lastModification: new Date(),
        };
        component.questions = [existingQuestion];
        component.questionForm.patchValue({ text: 'Existing Question' });
        component.proceedWithSave();
        expect(snackBar.open).toHaveBeenCalledWith('Une question avec ce titre existe déjà. Veuillez utiliser un titre différent.', 'Fermer', {
            duration: 3000,
        });
    });

    it('should show a snackbar message when a question with the same title already exists, but with a different id', () => {
        spyOn(snackBar, 'open');
        const existingQuestion: Question = {
            type: 'QCM',
            id: '1',
            text: 'Existing Question',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 20,
            lastModification: new Date(),
        };
        component.questions = [existingQuestion];
        component.questionForm.patchValue({ text: 'Existing Question' });
        component.questionId = '2';
        component.proceedWithSave();
        expect(snackBar.open).toHaveBeenCalledWith('Une question avec ce titre existe déjà. Veuillez utiliser un titre différent.', 'Fermer', {
            duration: 3000,
        });
    });

    it('should reset the correctAnswer form control when a choice is removed', () => {
        for (let i = 0; i < 3; i++) {
            component.choices.push(new FormControl());
        }

        component.questionForm.addControl('correctAnswer', new FormControl(0));
        spyOn(component.questionForm.get('correctAnswer') as FormControl, 'reset');
        component.removeChoice(0);
        expect((component.questionForm.get('correctAnswer') as FormControl).reset).toHaveBeenCalled();
    });

    it('should show a snackbar message when a question is successfully updated', () => {
        spyOn(snackBar, 'open');
        component.questionId = '1';
        component.questionForm.patchValue({ text: 'Updated Question' });
        component.proceedWithSave();
        expect(snackBar.open).toHaveBeenCalledWith('La question a été mise à jour avec succès.', 'Fermer', { duration: 3000 });
    });

    it('should show a snackbar message when saving a new question fails', () => {
        spyOn(snackBar, 'open');
        dataServiceMock.saveQuestion.and.returnValue(throwError(() => new Error('Failed to save')));
        component.questionForm.patchValue({ text: 'New Question' });
        component.proceedWithSave();
        expect(snackBar.open).toHaveBeenCalledWith("Une erreur s'est produite. Veuillez réessayer.", 'Fermer', { duration: 3000 });
    });

    it('should show a snackbar message when updating a question fails', () => {
        spyOn(snackBar, 'open');
        dataServiceMock.updateQuestion.and.returnValue(throwError(() => new Error('Failed to update')));
        component.questionId = '1';
        component.questionForm.patchValue({ text: 'Updated Question' });
        component.proceedWithSave();
        expect(snackBar.open).toHaveBeenCalledWith("Une erreur s'est produite lors de la mise à jour de la question.", 'Fermer', { duration: 3000 });
    });

    it('should save the form when it is valid and the user confirms', () => {
        // Mock MatDialog
        const matDialog = TestBed.inject(MatDialog);
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
        spyOn(matDialog, 'open').and.returnValue(dialogRefSpyObj);

        component.questionForm.patchValue({
            text: 'Valid Question',
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            points: 20,
        });

        component.onCorrectAnswerToggle(0, true);

        component.saveForm();

        component.saveForm();

        expect(matDialog.open).toHaveBeenCalled();

        expect(dataServiceMock.saveQuestion).toHaveBeenCalled();
    });

    it('should reset the form and redirect when a question is successfully updated', () => {
        spyOn(component, 'resetFormAndRedirect');
        component.questionId = '1';
        component.questionForm.patchValue({ text: 'Updated Question' });
        component.proceedWithSave();
        expect(component.resetFormAndRedirect).toHaveBeenCalled();
    });

    it('should initialize a new question form when "newQuestion" query param is true', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(component.questionId).toBeNull();
        expect(component.choices.length).toEqual(2);
    }));

    it('should handle error when fetching questions', () => {
        spyOn(snackBar, 'open');
        dataServiceMock.fetchQuestions.and.returnValue(throwError(() => Error('Question not found')));
        component.ngOnInit();
        expect(snackBar.open).toHaveBeenCalled();
    });

    it('should set choices correctly', () => {
        const choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];

        component.setChoices(choices);

        expect(component.choices.length).toEqual(choices.length);

        for (let i = 0; i < choices.length; i++) {
            expect(component.choices.at(i).value).toEqual({ text: choices[i].text });
        }
    });
    it('should return null when there are correct answers', () => {
        const formGroup = new FormBuilder().group({
            correctAnswers: new FormBuilder().array([0]),
        });

        const result = component.validateCorrectAnswers(formGroup);
        expect(result).toBeNull();
    });

    it('should return an error object when there are no correct answers', () => {
        const formGroup = new FormBuilder().group({
            correctAnswers: new FormBuilder().array([]),
        });

        const result = component.validateCorrectAnswers(formGroup);
        expect(result).toEqual({ noCorrectAnswer: true });
    });
    it('should not call saveQuestion or updateQuestion if the form is invalid', () => {
        component.questionForm.patchValue({
            text: '',
        });
        component.saveForm();
        expect(dataServiceMock.saveQuestion.calls.any()).toBeFalse();
        expect(dataServiceMock.updateQuestion.calls.any()).toBeFalse();
    });

    it('should toggle correct answer correctly', () => {
        component.addChoice();
        component.addChoice();
        component.onCorrectAnswerToggle(1, true);
        expect(component.isChoiceCorrect(1)).toBeTruthy();
        component.onCorrectAnswerToggle(1, false);
        expect(component.isChoiceCorrect(1)).toBeFalsy();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the question form', () => {
        expect(component.questionForm).toBeDefined();
        expect(component.choices.length).toBeGreaterThanOrEqual(2);
    });

    it('should add a choice to a question', () => {
        const initialLength = component.choices.length;
        component.addChoice();
        expect(component.choices.length).toBeGreaterThan(initialLength);
    });

    it('should remove a choice from a question', () => {
        component.addChoice();
        const initialLength = component.choices.length;
        component.removeChoice(initialLength - 1);
        expect(component.choices.length).toBeLessThan(initialLength);
    });
    it('should not remove a choice if there are only two choices available', () => {
        component.removeChoice(0);
        component.removeChoice(0);
        expect(component.choices.length).toEqual(2);
    });

    it('should not save a question with a duplicate title', () => {
        component.questionForm.patchValue({
            text: 'Sample Question',
        });
        component.saveForm();
        expect(dataServiceMock.saveQuestion.calls.any()).toBeFalse();
    });

    it('should handle error scenarios for save and update operations', () => {
        dataServiceMock.saveQuestion.and.returnValue(throwError(() => new Error('Failed to save')));
        component.questionForm.patchValue({
            text: '',
        });
        component.saveForm();
        expect(component.questionForm.valid).toBeFalsy();

        dataServiceMock.updateQuestion.and.returnValue(throwError(() => new Error('Failed to update')));
        component.loadQuestion(mockQuestion);
        component.questionForm.patchValue({
            text: '',
        });
        component.saveForm();
        expect(component.questionForm.valid).toBeFalsy();
    });

    it('should validate correct answers presence', () => {
        component.questionForm.patchValue({
            text: 'Updated Question',
            choices: [{ text: 'Updated Choice 1' }, { text: 'Updated Choice 2' }],
            correctAnswers: [0],
            points: 30,
        });

        const isValid = component.questionForm.valid;
        expect(isValid).toBeFalse();
    });

    it('should validate that points are a multiple of ten', () => {
        const testValue = 15;
        component.questionForm.controls['points'].setValue(testValue);
        expect(component.questionForm.invalid).toBeTruthy();
    });

    it('should validate max points', () => {
        const testValue = 150;
        component.questionForm.controls['points'].setValue(testValue);
        expect(component.questionForm.invalid).toBeTruthy();
    });

    it('should navigate to the admin view on successful save and reset', () => {
        component.resetFormAndRedirect();

        expect(routerMock.navigate).toHaveBeenCalledWith(['/vue-admin']);
    });

    it('should load question data into the form', () => {
        const questionData = {
            type: 'QCM',
            id: '1',
            text: 'Sample Question',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 20,
            lastModification: new Date(),
        };
        component.loadQuestion(questionData);
        expect(component.questionForm.value).toEqual({
            text: questionData.text,
            choices: questionData.choices.map((choice) => ({ text: choice.text })),
            correctAnswers: [0],
            points: questionData.points,
        });
    });
});
