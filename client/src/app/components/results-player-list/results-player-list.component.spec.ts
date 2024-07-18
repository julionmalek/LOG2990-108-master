// We still need to test for odd values for the many functions. That's why we allow this eslint-disable.
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expectedResultList, mockPlayerList } from './mock-results-list';
import { ResultsPlayerListComponent } from './results-player-list.component';
describe('ResultsPlayerListComponent', () => {
    let component: ResultsPlayerListComponent;
    let fixture: ComponentFixture<ResultsPlayerListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsPlayerListComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(ResultsPlayerListComponent);
        component = fixture.componentInstance;
        component.playerList = mockPlayerList;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getPodiumClass', () => {
        it('should return the correct position', () => {
            expect(component.getPodiumClass(0)).toEqual('gold');
            expect(component.getPodiumClass(1)).toEqual('silver');
            expect(component.getPodiumClass(2)).toEqual('bronze');
            expect(component.getPodiumClass(3)).toEqual('');
            expect(component.getPodiumClass(-1)).toEqual('');
        });
    });

    describe('sortResults', () => {
        it('should sort the results correctly', () => {
            expect(component.sortResults(mockPlayerList)).toEqual(expectedResultList);
        });
    });
});
