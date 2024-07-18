import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VueInitialeComponent } from './vue-initiale.component';

describe('VueInitialeComponent', () => {
    let component: VueInitialeComponent;
    let fixture: ComponentFixture<VueInitialeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [VueInitialeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(VueInitialeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
