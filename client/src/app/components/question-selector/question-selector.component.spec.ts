import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Question } from '@app/interfaces/question';
import { DataService } from '@app/services/data.service/data.service';
import { of, throwError } from 'rxjs';
import { QuestionSelectorComponent } from './question-selector.component';

describe('QuestionSelectorComponent', () => {
    let component: QuestionSelectorComponent;
    let fixture: ComponentFixture<QuestionSelectorComponent>;
    let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<QuestionSelectorComponent>>;
    let httpTestingController: HttpTestingController;
    let mockDataService: jasmine.SpyObj<DataService>;
    let snackBar: MatSnackBar;

    const mockQuestions: Question[] = [
        { type: 'QCM', id: '1', text: 'Question 1', choices: [], points: 1, lastModification: new Date() },
        { type: 'QCM', id: '2', text: 'Question 2', choices: [], points: 1, lastModification: new Date() },
    ];

    beforeEach(async () => {
        mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        mockDataService = jasmine.createSpyObj('DataService', ['fetchQuestions']);

        await TestBed.configureTestingModule({
            declarations: [QuestionSelectorComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [MatSnackBar, { provide: MatDialogRef, useValue: mockMatDialogRef }, { provide: DataService, useValue: mockDataService }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();

        httpTestingController = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        mockDataService.fetchQuestions.and.returnValue(of(new HttpResponse({ body: mockQuestions })));
        fixture = TestBed.createComponent(QuestionSelectorComponent);
        component = fixture.componentInstance;
        snackBar = TestBed.inject(MatSnackBar);
        fixture.detectChanges();
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should instantiate the component', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch questions on init', fakeAsync(() => {
        component.ngOnInit();
        expect(mockDataService.fetchQuestions).toHaveBeenCalled();
        fixture.detectChanges();
        expect(component.questions).toEqual(mockQuestions);
    }));

    it('should throw error if fetching questions fails', fakeAsync(() => {
        spyOn(snackBar, 'open');
        mockDataService.fetchQuestions.and.returnValue(throwError(() => Error('Question not found')));
        component.ngOnInit();
        expect(snackBar.open).toHaveBeenCalled();
    }));

    it('should select a question', () => {
        const question: Question = { type: 'QCM', id: '1', text: 'Test Question', choices: [], points: 1, lastModification: new Date() };

        component.selectQuestion(question);

        expect(component.selectedQuestion).toEqual(question);
        expect(component.errorVisible).toBeFalse();
    });

    it('should confirm selection and close dialog if a question is selected', () => {
        const question: Question = { type: 'QCM', id: '1', text: 'Test Question', choices: [], points: 1, lastModification: new Date() };
        component.selectedQuestion = question;

        component.confirmSelection();

        expect(mockMatDialogRef.close).toHaveBeenCalledWith(question);
    });

    it('should set errorVisible to true if no question is selected', () => {
        component.selectedQuestion = undefined;

        component.confirmSelection();

        expect(component.errorVisible).toBeTrue();
    });
});
