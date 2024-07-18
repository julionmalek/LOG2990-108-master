import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
    let authService: AuthenticationService;

    beforeEach(() => {
        authService = new AuthenticationService();
    });

    it('should be created', () => {
        expect(authService).toBeTruthy();
    });

    it('should initially have null token', (done) => {
        authService.token$.subscribe((token) => {
            expect(token).toBeNull();
            done();
        });
    });
    it('should emit null token after unsuccessful login', (done) => {
        const password = 'invalid-password';
        authService.login(password);

        authService.token$.subscribe((token) => {
            expect(token).toBeNull();
            done();
        });
    });

    it('should emit token after successful login', (done) => {
        const password = 'log2990-108';
        authService.login(password);

        authService.token$.subscribe((token) => {
            expect(token).toEqual('mon token');
            done();
        });
    });
});
