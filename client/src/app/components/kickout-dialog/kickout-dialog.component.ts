import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-kickout-dialog',
    templateUrl: './kickout-dialog.component.html',
    styleUrls: ['./kickout-dialog.component.scss'],
})
export class KickoutDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { reason: string }) {}
}
