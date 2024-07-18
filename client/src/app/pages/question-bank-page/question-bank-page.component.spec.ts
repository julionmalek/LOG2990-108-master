import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionBankPageComponent } from './question-bank-page.component';

describe('QuestionBankPageComponent', () => {
    let component: QuestionBankPageComponent;
    let fixture: ComponentFixture<QuestionBankPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(QuestionBankPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
