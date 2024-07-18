import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { of, throwError } from 'rxjs';
import { GameSelectPageComponent } from './game-select-page.component';

describe('GameSelectPageComponent', () => {
    let component: GameSelectPageComponent;
    let fixture: ComponentFixture<GameSelectPageComponent>;
    let dataService: DataService;
    let snackBar: MatSnackBar;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameSelectPageComponent],
            imports: [HttpClientTestingModule],
            providers: [DataService, MatSnackBar],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectPageComponent);
        component = fixture.componentInstance;
        dataService = TestBed.inject(DataService);
        snackBar = TestBed.inject(MatSnackBar);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch quizzes', fakeAsync(() => {
        const mockQuizzes: Quiz[] = [
            {
                id: '65b004d28aa297a064d51398',
                hidden: true,
                duration: 15,
                title: 'Mock Title 1',
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
        ];

        const httpResponse = new HttpResponse({
            body: mockQuizzes,
            status: 200,
        });

        // Set up the mock response before calling ngOnInit
        spyOn(dataService, 'fetchQuiz').and.returnValue(of(httpResponse));

        // Call ngOnInit after setting up the mock response
        component.ngOnInit();
        tick();

        expect(component.quizzes).toEqual(mockQuizzes);
    }));

    it('should fetch questions', fakeAsync(() => {
        const mockQuestions = [
            {
                type: 'QCM',
                id: '62a23958e5a9e9b88f853a67',
                text: 'Mock Question',
                showChoices: true,
                choices: [{ id: '65ac2356062811c6230e4f92', text: 'mock text', isCorrect: false }],
                points: 0,
                lastModification: new Date(),
            },
        ];

        const httpResponse = new HttpResponse({
            body: mockQuestions,
            status: 200,
        });

        // Set up the mock response before calling ngOnInit
        spyOn(dataService, 'fetchQuestions').and.returnValue(of(httpResponse));

        // Call ngOnInit after setting up the mock response
        component.ngOnInit();
        tick();

        expect(component.questions).toEqual(mockQuestions);
    }));

    it('should handle error when fetching questions', () => {
        spyOn(snackBar, 'open');
        spyOn(dataService, 'fetchQuestions').and.returnValue(throwError(() => new Error('Not found')));
        component.ngOnInit();
        expect(snackBar.open).toHaveBeenCalledWith('Erreur lors du chargement des questions. Veuillez reessayer plus tard.', '', {
            duration: 5000,
        });
    });

    it('should handle error when fetching quizzes', () => {
        spyOn(snackBar, 'open');
        spyOn(dataService, 'fetchQuiz').and.returnValue(throwError(() => new Error('Not found')));
        component.ngOnInit();
        expect(snackBar.open).toHaveBeenCalledWith('Erreur lors du chargement des quiz. Veuillez reessayer plus tard.', '', {
            duration: 5000,
        });
    });
});
