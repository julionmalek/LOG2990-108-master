import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DirectNavigationService } from './direct-navigation.service';

describe('DataService', () => {
    let service: DirectNavigationService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DirectNavigationService],
        });
        service = TestBed.inject(DirectNavigationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to revoke access', () => {
        service.revokeAccess();
        expect(service['hasAccess']).toBeFalsy();
    });

    it('should be able to grant access', () => {
        service.grantAccess();
        expect(service['hasAccess']).toBeTruthy();
    });

    it('should be able to return access status', () => {
        service.canNavigate();
        service['hasAccess'] = true;
        expect(service.canNavigate()).toBeTrue();
        service['hasAccess'] = false;
        expect(service.canNavigate()).toBeFalse();
    });
});
