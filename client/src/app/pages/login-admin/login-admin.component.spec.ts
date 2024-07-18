import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { LoginAdminComponent } from './login-admin.component';

describe('LoginAdminComponent', () => {
    let component: LoginAdminComponent;
    let fixture: ComponentFixture<LoginAdminComponent>;
    let authServiceMock: Partial<AuthenticationService>;
    let routerMock: Partial<Router>;
    let tokenSubject: BehaviorSubject<string | null>;

    beforeEach(async () => {
        tokenSubject = new BehaviorSubject<string | null>(null);

        authServiceMock = {
            token$: tokenSubject.asObservable(),
            login: (password: string) => {
                if (password === 'correctPassword') {
                    tokenSubject.next('fake-token');
                } else {
                    tokenSubject.next(null);
                }
            },
        };

        routerMock = {
            navigate: jasmine.createSpy('navigate'),
        };

        await TestBed.configureTestingModule({
            declarations: [LoginAdminComponent],
            providers: [
                { provide: AuthenticationService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginAdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to "vue-admin" on successful login', async () => {
        component.motDePasse = 'correctPassword';
        await component.verifyPassword();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(routerMock.navigate).toHaveBeenCalledWith(['vue-admin']);
    });

    it('should not navigate and show an error message on failed login', async () => {
        component.motDePasse = 'wrongPassword';
        await component.verifyPassword();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(component.errorMessage).toEqual('Échec de la vérification du mot de passe.');
    });
    it('should set errorMessage on login method error', async () => {
        authServiceMock.login = jasmine.createSpy().and.callFake(() => {
            throw new Error('Error during login');
        });

        component.motDePasse = 'anyPassword';
        await component.verifyPassword();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.errorMessage).toEqual('Erreur lors de la vérification du mot de passe.');
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });
});
