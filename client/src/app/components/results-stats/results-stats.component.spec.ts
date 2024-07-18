/* eslint-disable @typescript-eslint/no-magic-numbers */
// the magic numbers are used for tests
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Quiz } from '@app/interfaces/quiz';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { ResultsStatsComponent } from './results-stats.component';

describe('ResultsStatsComponent', () => {
    let component: ResultsStatsComponent;
    let fixture: ComponentFixture<ResultsStatsComponent>;
    let mockBarChartData: ChartData<'bar', (number | [number, number] | null)[]>;
    let mockBarChartType: keyof ChartTypeRegistry;

    const mockHistogramData = [
        { option1: 10, option2: 5, option3: 7, option4: 2 },
        { option1: 15, option2: 10, option3: 5, option4: 3 },
        { option1: 20, option2: 15, option3: 10, option4: 4 },
    ];
    const mockQuiz: Quiz = {
        hidden: false,
        title: 'European Geography Quiz',
        description: 'Test your knowledge about European capitals.',
        duration: 30,
        questions: [
            {
                id: 'q1',
                type: 'multiple-choice',
                text: 'What is the capital of France?',
                choices: [
                    { id: 'q1c1', text: 'Paris', isCorrect: true },
                    { id: 'q1c2', text: 'London', isCorrect: false },
                    { id: 'q1c3', text: 'Berlin', isCorrect: false },
                    { id: 'q1c4', text: 'Quebec', isCorrect: false },
                ],
                points: 10,
                showChoices: true,
                lastModification: new Date(),
            },
            {
                id: 'q2',
                type: 'multiple-choice',
                text: 'What is the capital of Germany?',
                choices: [
                    { id: 'q2c1', text: 'Paris', isCorrect: false },
                    { id: 'q2c2', text: 'London', isCorrect: false },
                    { id: 'q2c3', text: 'Berlin', isCorrect: true },
                    { id: 'q2c4', text: 'Toronto', isCorrect: false },
                ],
                points: 10,
                showChoices: true,
                lastModification: new Date(),
            },
            {
                id: 'q2',
                type: 'multiple-choice',
                text: 'What is the capital of England?',
                choices: [
                    { id: 'q2c1', text: 'Paris', isCorrect: false },
                    { id: 'q2c2', text: 'London', isCorrect: true },
                    { id: 'q2c3', text: 'Berlin', isCorrect: false },
                    { id: 'q2c4', text: 'Montreal', isCorrect: false },
                ],
                points: 10,
                showChoices: true,
                lastModification: new Date(),
            },
        ],
        lastModification: new Date(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsStatsComponent],
        });
        fixture = TestBed.createComponent(ResultsStatsComponent);
        component = fixture.componentInstance;
        component.histogramData = mockHistogramData;
        component.quiz = mockQuiz;
        component.barChartData = mockBarChartData;
        component.barChartType = mockBarChartType;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get data on initialization', () => {
        spyOn(component, 'setUpChart');
        component.ngOnInit();
        expect(component.setUpChart).toHaveBeenCalledWith(0);
        expect(component.currentQuestion).toBe(0);
    });

    it('should set up the chart data on creation', () => {
        component.ngOnInit();
        expect(component.histogramData).toBeTruthy();
        const chart = fixture.debugElement.query(By.css('.chart')).nativeElement;
        expect(chart).toBeTruthy();
        expect(component.barChartData).toBeTruthy();
        expect(component.barChartData.datasets[0].data).toEqual([10, 5, 7, 2]);
        expect(component.barChartData.labels).toEqual(['Paris', 'London', 'Berlin', 'Quebec']);
    });

    it('should navigate to the next question results correctly', () => {
        component.currentQuestion = 1;
        component.getNextResults();
        fixture.detectChanges();
        expect(component.currentQuestion).toBe(2);
        expect(component.barChartData.datasets[0].data).toEqual([20, 15, 10, 4]);
        expect(component.barChartData.labels).toEqual(['Paris', 'London', 'Berlin', 'Montreal']);
    });

    it('should not navigate to the next question results if on the last question', () => {
        // Setting the default values of the last question
        component.currentQuestion = 2;
        component.barChartData.datasets[0].data = [20, 15, 10, 4];
        component.barChartData.labels = ['Paris', 'London', 'Berlin', 'Montreal'];

        component.getNextResults();
        fixture.detectChanges();

        expect(component.currentQuestion).toBe(2);
        expect(component.barChartData.datasets[0].data).toEqual([20, 15, 10, 4]);
        expect(component.barChartData.labels).toEqual(['Paris', 'London', 'Berlin', 'Montreal']);
    });

    it('should navigate to the previous question results correctly', () => {
        component.currentQuestion = 1;
        component.getPreviousResults();
        fixture.detectChanges();
        expect(component.currentQuestion).toBe(0);
        expect(component.barChartData.datasets[0].data).toEqual([10, 5, 7, 2]);
        expect(component.barChartData.labels).toEqual(['Paris', 'London', 'Berlin', 'Quebec']);
    });

    it('should not navigate to the previous question results if on the first question', () => {
        // Setting the default values of the first question
        component.currentQuestion = 0;
        component.barChartData.datasets[0].data = [10, 5, 7, 2];
        component.barChartData.labels = ['Paris', 'London', 'Berlin', 'Quebec'];

        component.getPreviousResults();
        fixture.detectChanges();

        expect(component.currentQuestion).toBe(0);
        expect(component.barChartData.datasets[0].data).toEqual([10, 5, 7, 2]);
        expect(component.barChartData.labels).toEqual(['Paris', 'London', 'Berlin', 'Quebec']);
    });
});
