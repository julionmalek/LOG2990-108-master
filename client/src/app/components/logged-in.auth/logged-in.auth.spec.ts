import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggedInAuth } from './logged-in.auth';

describe('LoggedInAuth', () => {
    let guard: LoggedInAuth;
    let routerMock: jasmine.SpyObj<Router>;
    let authServiceMock: Partial<AuthenticationService>;
    let tokenSubject: BehaviorSubject<string | null>;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
        tokenSubject = new BehaviorSubject<string | null>(null);
        authServiceMock = {
            token$: tokenSubject.asObservable(),
        };

        TestBed.configureTestingModule({
            providers: [LoggedInAuth, { provide: Router, useValue: routerMock }, { provide: AuthenticationService, useValue: authServiceMock }],
        });

        guard = TestBed.inject(LoggedInAuth);
    });

    it('should redirect to login-admin if not authenticated', (done) => {
        tokenSubject.next(null);
        const result = guard.canActivate();
        if (result instanceof Observable) {
            result.subscribe((isAllowed) => {
                expect(isAllowed).toBeFalse();
                expect(routerMock.navigate).toHaveBeenCalledWith(['login-admin']);
                done();
            });
        } else {
            expect(result).toBeFalse();
            expect(routerMock.navigate).toHaveBeenCalledWith(['login-admin']);
            done();
        }
    });

    it('should allow access if user authenticated', (done) => {
        tokenSubject.next('fake-token');
        const result = guard.canActivate();
        if (result instanceof Observable) {
            result.subscribe((isAllowed) => {
                expect(isAllowed).toBeTrue();
                expect(routerMock.navigate).not.toHaveBeenCalled();
                done();
            });
        } else {
            expect(result).toBeTrue();
            expect(routerMock.navigate).not.toHaveBeenCalled();
            done();
        }
    });
});
