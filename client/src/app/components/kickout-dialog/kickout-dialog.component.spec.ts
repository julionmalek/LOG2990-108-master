import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { KickoutDialogComponent } from './kickout-dialog.component';

describe('KickoutDialogComponent', () => {
    let component: KickoutDialogComponent;
    let fixture: ComponentFixture<KickoutDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [KickoutDialogComponent],
            imports: [MatDialogModule],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { reason: 'Test Reason' } }],
        });
        fixture = TestBed.createComponent(KickoutDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
