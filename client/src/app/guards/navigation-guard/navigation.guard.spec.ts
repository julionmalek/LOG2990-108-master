import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { CanComponentDeactivate } from '@app/interfaces/can-component-deactivate';
import { navigationGuard } from './navigation.guard';

describe('navigationGuard', () => {
    let currentRoute: ActivatedRouteSnapshot;
    let currentState: RouterStateSnapshot;
    let nextState: RouterStateSnapshot;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        currentRoute = {} as ActivatedRouteSnapshot;
        currentState = {} as RouterStateSnapshot;
        nextState = {} as RouterStateSnapshot;
    });

    it('should allow deactivation if component can deactivate', () => {
        const component = { canDeactivate: () => true };
        expect(navigationGuard(component, currentRoute, currentState, nextState)).toBe(true);
    });

    it('should prevent deactivation if component cannot deactivate', () => {
        const component = { canDeactivate: () => false };
        expect(navigationGuard(component, currentRoute, currentState, nextState)).toBe(false);
    });

    it('should allow deactivation if component does not implement canDeactivate', () => {
        const component = {};
        expect(navigationGuard(component as CanComponentDeactivate, currentRoute, currentState, nextState)).toBe(true);
    });
});
