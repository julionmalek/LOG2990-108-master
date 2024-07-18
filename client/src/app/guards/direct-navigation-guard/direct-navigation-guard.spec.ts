import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { directNavigationGuard } from './direct-navigation-guard';

describe('NavigationGuard', () => {
    let mockNav: jasmine.Spy;
    beforeEach(() => {
        mockNav = spyOn(DirectNavigationService.prototype, 'canNavigate');
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DirectNavigationService],
        });
    });
    it('should be able to be called', async () => {
        mockNav.and.returnValue(true);
        const result = await TestBed.runInInjectionContext(async () =>
            directNavigationGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
        );
        expect(result).toBeTrue();

        spyOn(Router.prototype, 'createUrlTree');
        mockNav.and.returnValue(false);
        await TestBed.runInInjectionContext(async () => directNavigationGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
        expect(Router.prototype.createUrlTree).toHaveBeenCalledWith(['/joindre-partie']);
    });
});
