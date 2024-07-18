import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service/authentication.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class LoggedInAuth {
    constructor(
        private authService: AuthenticationService,
        private router: Router,
    ) {}

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.token$.pipe(
            map((token) => {
                if (!token) {
                    this.router.navigate(['login-admin']);
                    return false;
                }
                return true;
            }),
        );
    }
}
