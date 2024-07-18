import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Question } from '@app/interfaces/question';
import { DataService } from '@app/services/data.service/data.service';
import { of } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { QuestionsBoxListComponent } from './questions-box-list.component';

describe('QuestionsBoxListComponent', () => {
    let component: QuestionsBoxListComponent;
    let fixture: ComponentFixture<QuestionsBoxListComponent>;
    let dataServiceMock: jasmine.SpyObj<DataService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;
    let router: Router;

    beforeEach(async () => {
        dataServiceMock = jasmine.createSpyObj('DataService', ['fetchQuestions', 'deleteQuestion']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            declarations: [QuestionsBoxListComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: DataService, useValue: dataServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionsBoxListComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        dataServiceMock.fetchQuestions.and.returnValue(of(new HttpResponse({ status: 200, body: [] })));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load questions on component initialization', () => {
        expect(dataServiceMock.fetchQuestions).toHaveBeenCalled();
        expect(component.questions.length).toBe(0);
    });

    it('should redirect to question bank', () => {
        spyOn(router, 'navigate').and.stub();
        component.redirectToQuestionBank();
        expect(router.navigate).toHaveBeenCalledWith(['/question-bank']);
    });

    it('should delete a question', () => {
        const mockQuestions: Question[] = [
            {
                type: 'QCM',
                id: '1',
                text: 'Test',
                choices: [],
                points: 20,
                showChoices: true,
                lastModification: new Date(),
            },
        ];
        component.questions = mockQuestions;

        matDialogMock.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof ConfirmDialogComponent>);
        dataServiceMock.deleteQuestion.and.returnValue(of(new HttpResponse<Question>({ status: 204, body: {} as Question })));
        component.deleteQuestion(0);
        expect(dataServiceMock.deleteQuestion).toHaveBeenCalledWith('1');
        expect(component.questions).toEqual([]);
    });

    it('should edit a question', () => {
        const mockQuestion: Question = {
            type: 'QCM',
            id: '1',
            text: 'Test Question?',
            choices: [],
            points: 10,
            showChoices: true,
            lastModification: new Date(),
        };
        component.questions = [mockQuestion];
        spyOn(router, 'navigate').and.stub();

        component.editQuestion(0);

        expect(router.navigate).toHaveBeenCalledWith(['/question-bank']);
    });
});
