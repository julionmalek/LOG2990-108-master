import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service/authentication.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-login-admin',
    templateUrl: './login-admin.component.html',
    styleUrls: ['./login-admin.component.scss'],
})
export class LoginAdminComponent {
    motDePasse: string = '';
    errorMessage: unknown;
    destroy$: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private authService: AuthenticationService,
    ) {}

    async verifyPassword(): Promise<void> {
        try {
            const password = this.motDePasse;

            this.authService.login(password);
            this.authService.token$.pipe(takeUntil(this.destroy$)).subscribe((token) => {
                if (token) {
                    this.router.navigate(['vue-admin']);
                } else {
                    this.errorMessage = 'Échec de la vérification du mot de passe.';
                }
            });
        } catch (error) {
            this.errorMessage = 'Erreur lors de la vérification du mot de passe.';
        }
    }
}
