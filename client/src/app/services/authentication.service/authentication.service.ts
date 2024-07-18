import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    get token$(): Observable<string | null> {
        return this.tokenSubject.asObservable();
    }

    login(password: string): void {
        const isAuthenticated = this.verifyPasswordLocally(password);

        if (isAuthenticated) {
            const token = 'mon token';
            this.tokenSubject.next(token);
        } else {
            this.tokenSubject.next(null);
        }
    }

    private verifyPasswordLocally(password: string): boolean {
        return password === 'log2990-108';
    }
}
