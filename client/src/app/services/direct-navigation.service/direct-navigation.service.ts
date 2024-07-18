import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DirectNavigationService {
    private hasAccess: boolean = false;

    grantAccess() {
        this.hasAccess = true;
    }
    revokeAccess() {
        this.hasAccess = false;
    }

    canNavigate(): boolean {
        return this.hasAccess;
    }
}
