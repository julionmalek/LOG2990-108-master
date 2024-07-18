/* eslint-disable max-lines */
// Since it's a test file, we deemed a good idea to not split it in different parts.
import { HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PopupComponent } from '@app/components/popup/popup.component';
import { DataService } from '@app/services/data.service/data.service';
import { of, throwError } from 'rxjs';
import { QuizCardComponent } from './quiz-card.component';

describe('QuizCardComponent', () => {
    let component: QuizCardComponent;
    let fixture: ComponentFixture<QuizCardComponent>;
    let matSnackBarMock: jasmine.SpyObj<MatSnackBar>;
    let dataServiceMock: jasmine.SpyObj<DataService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;
    let matDialogRefMock: jasmine.SpyObj<MatDialogRef<typeof PopupComponent>>;
    beforeEach(() => {
        matSnackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        dataServiceMock = jasmine.createSpyObj('DataService', ['fetchQuizById', 'toggleQuizHidden', 'deleteQuiz']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.callFake(() => {
            return {
                afterClosed: () => of({ refetchQuizzes: true }),
            } as MatDialogRef<typeof PopupComponent>;
        });
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        TestBed.configureTestingModule({
            declarations: [QuizCardComponent],
            imports: [MatSnackBarModule, HttpClientTestingModule],
            providers: [
                { provide: DataService, useValue: dataServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: MatSnackBar, useValue: matSnackBarMock },
                { provide: MatDialogRef, useValue: matDialogRefMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(QuizCardComponent);
        component = fixture.componentInstance;

        component.quiz = {
            id: '65b004d28aa297a064d51398',
            hidden: false,
            duration: 15,
            title: 'Mock Title',
            description: 'Mock Description',
            questions: [
                {
                    type: 'QCM',
                    id: '62a23958e5a9e9b88f853a67',
                    text: 'Mock Question',
                    showChoices: true,
                    choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                    points: 0,
                    lastModification: new Date(),
                },
            ],
            lastModification: new Date(),
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch quiz when clicked', () => {
        const mockQuiz = new HttpResponse({
            body: {
                id: '65b004d28aa297a064d51398',
                hidden: false,
                duration: 15,
                title: 'Mock Title',
                description: 'Mock Description',
                questions: [
                    {
                        type: 'QCM',
                        id: '62a23958e5a9e9b88f853a67',
                        text: 'Mock Question',
                        showChoices: true,
                        choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                        points: 0,
                        lastModification: new Date(),
                    },
                ],
                lastModification: new Date(),
            },
            status: 200,
        });
        dataServiceMock.fetchQuizById.and.returnValue(of(mockQuiz));

        component.click();

        expect(dataServiceMock.fetchQuizById).toHaveBeenCalledWith('65b004d28aa297a064d51398');
    });
    it('should show a snackbar and emit fetchNeeded when the quiz is hidden', () => {
        const hiddenQuizResponse = new HttpResponse({
            body: {
                id: '65b004d28aa297a064d51398',
                hidden: true,
                duration: 15,
                title: 'Mock Title',
                description: 'Mock Description',
                questions: [
                    {
                        type: 'QCM',
                        id: '62a23958e5a9e9b88f853a67',
                        text: 'Mock Question',
                        showChoices: true,
                        choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                        points: 0,
                        lastModification: new Date(),
                    },
                ],
                lastModification: new Date(),
            },
            status: 200,
        });
        dataServiceMock.fetchQuizById.and.returnValue(of(hiddenQuizResponse));
        spyOn(component.fetchNeeded, 'emit');

        component.click();

        expect(matSnackBarMock.open).toHaveBeenCalledWith(
            'Ce questionnaire a été caché. Veuillez sélectionner un autre questionnaire dans la liste.',
            '',
            { duration: 5000, panelClass: ['quiz-snackbar'] },
        );
        expect(component.fetchNeeded.emit).toHaveBeenCalled();
    });

    it('should show a snackbar and emit event when the quiz is not found', () => {
        dataServiceMock.fetchQuizById.and.returnValue(throwError(() => new HttpResponse({ status: HttpStatusCode.NotFound })));

        spyOn(component.fetchNeeded, 'emit');

        component.click();

        expect(matSnackBarMock.open).toHaveBeenCalledWith(
            'Ce questionnaire a été supprimé. Veuillez sélectionner un autre questionnaire dans la liste.',
            '',
            { duration: 5000, panelClass: ['quiz-snackbar'] },
        );
        expect(component.fetchNeeded.emit).toHaveBeenCalled();
    });

    it('should toggle quiz hidden', () => {
        const hiddenQuizResponse = new HttpResponse({
            body: {
                id: '65b004d28aa297a064d51398',
                hidden: true,
                duration: 15,
                title: 'Mock Title',
                description: 'Mock Description',
                questions: [
                    {
                        type: 'QCM',
                        id: '62a23958e5a9e9b88f853a67',
                        text: 'Mock Question',
                        showChoices: true,
                        choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                        points: 0,
                        lastModification: new Date(),
                    },
                ],
                lastModification: new Date(),
            },
            status: 200,
        });
        dataServiceMock.toggleQuizHidden.and.returnValue(of(hiddenQuizResponse));

        spyOn(component.fetchNeeded, 'emit');

        component.toggleHidden();

        expect(dataServiceMock.toggleQuizHidden).toHaveBeenCalledWith('65b004d28aa297a064d51398', false);
        expect(component.fetchNeeded.emit).toHaveBeenCalled();
    });

    it('should manage error when toggling quiz hidden', () => {
        dataServiceMock.toggleQuizHidden.and.returnValue(throwError(() => new HttpResponse({ status: HttpStatusCode.NotFound })));

        spyOn(component.fetchNeeded, 'emit');

        component.quiz.id = undefined;
        component.toggleHidden();

        expect(dataServiceMock.toggleQuizHidden).toHaveBeenCalledWith('', false);
        expect(component.fetchNeeded.emit).toHaveBeenCalled();
    });
    it('should delete quiz and emit fetchNeeded when user confirms deletion', () => {
        const mockQuiz = new HttpResponse({
            body: {
                id: '65b004d28aa297a064d51398',
                hidden: false,
                duration: 15,
                title: 'Mock Title',
                description: 'Mock Description',
                questions: [
                    {
                        type: 'QCM',
                        id: '62a23958e5a9e9b88f853a67',
                        text: 'Mock Question',
                        showChoices: true,
                        choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                        points: 0,
                        lastModification: new Date(),
                    },
                ],
                lastModification: new Date(),
            },
            status: 200,
        });
        matDialogRefMock.afterClosed.and.returnValue(of(true)); // User confirms deletion
        matDialogMock.open.and.returnValue(matDialogRefMock);
        dataServiceMock.deleteQuiz.and.returnValue(of(mockQuiz));
        spyOn(component.fetchNeeded, 'emit');
        component.delete();
        expect(matDialogMock.open).toHaveBeenCalled();
        expect(dataServiceMock.deleteQuiz).toHaveBeenCalledWith('65b004d28aa297a064d51398');
        expect(component.fetchNeeded.emit).toHaveBeenCalled();
    });

    it('should delete quiz and emit fetchNeeded when user confirms deletion', () => {
        const mockQuiz = new HttpResponse({
            body: {
                id: '',
                hidden: false,
                duration: 15,
                title: 'Mock Title',
                description: 'Mock Description',
                questions: [
                    {
                        type: 'QCM',
                        id: '',
                        text: 'Mock Question',
                        showChoices: true,
                        choices: [{ id: '', text: 'mock text', isCorrect: false }],
                        points: 0,
                        lastModification: new Date(),
                    },
                ],
                lastModification: new Date(),
            },
            status: 200,
        });
        matDialogRefMock.afterClosed.and.returnValue(of(true)); // User confirms deletion
        matDialogMock.open.and.returnValue(matDialogRefMock);
        dataServiceMock.deleteQuiz.and.returnValue(of(mockQuiz));
        spyOn(component.fetchNeeded, 'emit');
        component.quiz.id = '';
        component.delete();
        expect(matDialogMock.open).toHaveBeenCalled();
        expect(dataServiceMock.deleteQuiz).toHaveBeenCalledWith('');
        expect(component.fetchNeeded.emit).toHaveBeenCalled();
    });

    it('should show snackbar on delete quiz error', () => {
        const errorResponse = new HttpErrorResponse({
            error: 'Error deleting quiz',
            status: 500,
            statusText: 'Internal Server Error',
        });
        matDialogRefMock.afterClosed.and.returnValue(of(true));
        matDialogMock.open.and.returnValue(matDialogRefMock);
        dataServiceMock.deleteQuiz.and.returnValue(throwError(() => errorResponse));

        component.delete();

        expect(dataServiceMock.deleteQuiz).toHaveBeenCalled();
        expect(matSnackBarMock.open).toHaveBeenCalledWith(errorResponse.error, '', { duration: 5000, panelClass: ['warn-snackbar'] });
    });

    it('should not delete quiz when user cancels deletion', () => {
        matDialogRefMock.afterClosed.and.returnValue(of(false));
        matDialogMock.open.and.returnValue(matDialogRefMock);

        component.delete();

        expect(dataServiceMock.deleteQuiz).not.toHaveBeenCalled();
    });

    it('should return not found with empty id', () => {
        component.quiz.id = '';
        dataServiceMock.fetchQuizById.and.returnValue(throwError(() => new HttpResponse({ status: HttpStatusCode.NotFound })));
        component.click();
        expect(dataServiceMock.fetchQuizById).toHaveBeenCalledWith('');
        expect(matSnackBarMock.open).toHaveBeenCalled();
    });

    describe('download', () => {
        it('should allow download of a quiz', () => {
            const mockExportedQuiz = {
                id: '65b004d28aa297a064d51398',
                title: 'Mock Title',
                description: 'Mock Description',
                duration: 15,
                lastModification: component.quiz.lastModification,
                questions: [
                    {
                        type: 'QCM',
                        text: 'Mock Question',
                        points: 0,
                        choices: [{ text: 'mock text', isCorrect: false }],
                    },
                ],
            };
            spyOn(JSON, 'stringify').and.returnValue('{mockJson}');
            component.download();
            expect(JSON.stringify).toHaveBeenCalledWith(mockExportedQuiz, null, 2);
        });

        it('should allow download of a quiz even with missing quiz id', () => {
            const mockExportedQuiz = {
                id: '',
                title: 'Mock Title',
                description: 'Mock Description',
                duration: 15,
                lastModification: component.quiz.lastModification,
                questions: [
                    {
                        type: 'QCM',
                        text: 'Mock Question',
                        points: 0,
                        choices: [{ text: 'mock text', isCorrect: false }],
                    },
                ],
            };
            component.quiz.id = undefined;
            spyOn(JSON, 'stringify').and.returnValue('{mockJson}');
            component.download();
            expect(JSON.stringify).toHaveBeenCalledWith(mockExportedQuiz, null, 2);
        });
    });
});
