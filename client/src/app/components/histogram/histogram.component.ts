import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HistogramData } from '@app/services/websocket.service/websocket.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnChanges {
    @Input() data: HistogramData;

    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        scales: {
            x: {},
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };

    barChartType: ChartType = 'bar';
    barChartData: ChartData<'bar'>;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data && changes.data.currentValue) {
            this.processData(changes.data.currentValue);
        }
    }

    private processData(data: HistogramData): void {
        const chartLabels = data.choicesData.map((choice) => choice.title);
        const chartDataSets = [
            {
                data: data.choicesData.map((choice) => choice.count),
                label: data.questionTitle,
                backgroundColor: data.choicesData.map((choice) => (choice.isCorrect ? '#4CAF50' : '#F44336')),
            },
        ];

        this.barChartData = {
            labels: chartLabels,
            datasets: chartDataSets,
        };
    }
}
