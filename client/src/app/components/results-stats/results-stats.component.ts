import { Component, Input, OnInit } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
    selector: 'app-results-stats',
    templateUrl: './results-stats.component.html',
    styleUrls: ['./results-stats.component.scss'],
})
export class ResultsStatsComponent implements OnInit {
    @Input() histogramData: { [key: string]: number }[];
    @Input() quiz: Quiz;
    barChartData: ChartData<'bar'>;
    barChartType: ChartType = 'bar';
    barChartOptions: ChartOptions;
    currentQuestion: number;

    ngOnInit(): void {
        this.currentQuestion = 0;
        this.setUpChart(0);
    }

    setUpChart(questionNumber: number) {
        const currentData = this.histogramData[questionNumber];
        const question = this.quiz.questions[questionNumber];
        const labels = question.choices.map((choice) => choice.text);
        const data = Object.values(currentData);
        const backgroundColor = question.choices.map((choice) => (choice.isCorrect ? '#4CAF50' : '#F44336'));

        this.barChartData = {
            labels,
            datasets: [
                {
                    data,
                    label: 'Répartition des réponses',
                    backgroundColor,
                },
            ],
        };

        this.barChartOptions = {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                    },
                },
            },
        };
    }

    getPreviousResults() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.setUpChart(this.currentQuestion);
        }
    }
    getNextResults() {
        if (this.currentQuestion < this.histogramData.length - 1) {
            this.currentQuestion++;
            this.setUpChart(this.currentQuestion);
        }
    }
}
