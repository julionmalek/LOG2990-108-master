import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { of } from 'rxjs';
import { VueAdministrateurComponent } from './vue-administrateur.component';

describe('VueAdministrateurComponent', () => {
    let component: VueAdministrateurComponent;
    let fixture: ComponentFixture<VueAdministrateurComponent>;
    let dataServiceMock: jasmine.SpyObj<DataService>;
    beforeEach(async () => {
        dataServiceMock = jasmine.createSpyObj('DataService', ['fetchQuiz']);
        await TestBed.configureTestingModule({
            declarations: [VueAdministrateurComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: DataService, useValue: dataServiceMock }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(VueAdministrateurComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect to question bank with newQuestion query param', () => {
        const routerSpy = TestBed.inject(Router);
        const navigateSpy = spyOn(routerSpy, 'navigate');
        component.redirectBanquequiz();
        expect(navigateSpy).toHaveBeenCalledWith(['question-bank'], { queryParams: { newQuestion: 'true' } });
    });

    it('should fetch quizzes on init', () => {
        const mockQuizzes: Quiz[] = [
            {
                id: '1',
                hidden: false,
                title: 'Quiz 1',
                description: 'Description 1',
                duration: 40,
                questions: [],
                lastModification: new Date(),
            },
            {
                id: '2',
                hidden: false,
                title: 'Quiz 2',
                description: 'Description 2',
                duration: 40,
                questions: [],
                lastModification: new Date(),
            },
        ];
        dataServiceMock.fetchQuiz.and.returnValue(of(new HttpResponse({ body: mockQuizzes })));
        fixture.detectChanges();
        expect(component.quizzes.length).toBe(2);
        expect(component.quizzes).toEqual(mockQuizzes);
        expect(dataServiceMock.fetchQuiz).toHaveBeenCalled();
    });
});
