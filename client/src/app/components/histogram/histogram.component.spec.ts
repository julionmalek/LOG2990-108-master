/* eslint-disable @typescript-eslint/no-magic-numbers */
/// / These magic numbers are used for tests.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramData } from '@app/services/websocket.service/websocket.service';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HistogramComponent],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should process data on ngOnChanges', () => {
        const data: HistogramData = {
            questionTitle: 'Test Question',
            choicesData: [
                { title: 'Choice 1', count: 10, isCorrect: true },
                { title: 'Choice 2', count: 20, isCorrect: false },
            ],
        };
        component.data = data;
        component.ngOnChanges({
            data: {
                previousValue: null,
                currentValue: data,
                firstChange: true,
                isFirstChange: () => true,
            },
        });

        expect(component.barChartData.labels).toEqual(['Choice 1', 'Choice 2']);
        expect(component.barChartData.datasets[0].data).toEqual([10, 20]);
        expect(component.barChartData.datasets[0].backgroundColor).toEqual(['#4CAF50', '#F44336']);
    });
});
