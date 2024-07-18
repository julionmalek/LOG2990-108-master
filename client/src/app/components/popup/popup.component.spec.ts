import { HttpResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { of, throwError } from 'rxjs';
import { PopupComponent } from './popup.component';

describe('PopupComponent', () => {
    let component: PopupComponent;
    let fixture: ComponentFixture<PopupComponent>;
    let dataServiceMock: jasmine.SpyObj<DataService>;
    let snackBarMock: jasmine.SpyObj<MatSnackBar>;
    let routerMock: jasmine.SpyObj<Router>;
    let webSocketServiceMock: jasmine.SpyObj<WebsocketService>;
    let dialogRefMock: jasmine.SpyObj<MatDialogRef<PopupComponent>>;
    let sidebarServiceMock: jasmine.SpyObj<SidebarService>;

    const mockData: Quiz = {
        id: '1',
        title: 'Mock Quiz',
        description: 'Mock Quiz Description',
        duration: 10,
        questions: [
            {
                type: 'QCM',
                id: '1',
                text: 'Test Question',
                showChoices: true,
                choices: [{ id: '1', text: 'Choice 1', isCorrect: true }],
                points: 0,
                lastModification: new Date(),
            },
        ],
        lastModification: new Date(),
        hidden: true,
    };

    beforeEach(async () => {
        dataServiceMock = jasmine.createSpyObj('DataService', ['fetchQuizById', 'createGame']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        sidebarServiceMock = jasmine.createSpyObj('SidebarService', ['close']);
        webSocketServiceMock = jasmine.createSpyObj('WebsocketService', ['createRoom', 'createTestRoom', 'setPlayerName', 'reset']);

        Object.defineProperty(webSocketServiceMock, 'socketId', { get: () => 'mock-socket-id' });
        webSocketServiceMock.connected$ = of(true);

        await TestBed.configureTestingModule({
            declarations: [PopupComponent],
            providers: [
                { provide: DataService, useValue: dataServiceMock },
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: Router, useValue: routerMock },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: WebsocketService, useValue: webSocketServiceMock },
                { provide: SidebarService, useValue: sidebarServiceMock },
                { provide: MAT_DIALOG_DATA, useValue: mockData },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(PopupComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close sidebar and navigate on successful redirectToTestGamePage', fakeAsync(() => {
        component.redirectToTestGamePage();
        tick();

        expect(sidebarServiceMock.close).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game-page', 'mock-socket-id'], { state: { mode: 'testing' } });
    }));

    it('should create and set showChoices to false for each question in data', () => {
        fixture = TestBed.createComponent(PopupComponent);
        component = fixture.componentInstance;
        expect(component).toBeTruthy();
        expect(component.quiz.questions.every((question) => !question.showChoices)).toBeTrue();
    });

    it('should set showChoices to false for each question in data', () => {
        expect(component.quiz.questions.every((question) => !question.showChoices)).toBeTrue();
    });

    it('should toggle question choices', () => {
        const mockQuestion: Question = {
            type: 'QCM',
            id: '1',
            text: 'Test Question',
            showChoices: true,
            choices: [{ id: '1', text: 'Choice 1', isCorrect: true }],
            points: 0,
            lastModification: new Date(),
        };

        component.toggleQuestionChoices(mockQuestion);
        component.toggleQuestionChoices(mockQuestion);
        expect(mockQuestion.showChoices).toBeTruthy();
        component.toggleQuestionChoices(mockQuestion);
        expect(mockQuestion.showChoices).toBeFalsy();
    });
    it('should navigate to waiting page on successful redirectToWaitingPage', () => {
        const response = new HttpResponse({ body: { gameId: '1' } });
        dataServiceMock.createGame.and.returnValue(of(response));

        component.redirectToWaitingPage();

        if (response.body) {
            expect(webSocketServiceMock.isOrganizer).toEqual(true);
            expect(webSocketServiceMock.setPlayerName).toHaveBeenCalledWith('Organisateur');
            expect(webSocketServiceMock.createRoom).toHaveBeenCalledWith(response.body.gameId, mockData);
            expect(routerMock.navigate).toHaveBeenCalledWith(['/waiting-page', response.body.gameId]);
        }
        expect(sidebarServiceMock.close).toHaveBeenCalled();
        expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should handle error when attempting to navigate to waiting page', () => {
        dataServiceMock.createGame.and.returnValue(throwError(() => new Error()));

        component.redirectToWaitingPage();

        expect(dialogRefMock.close).toHaveBeenCalled();
    });
});
