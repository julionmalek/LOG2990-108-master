import { CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from '@app/interfaces/can-component-deactivate';

export const navigationGuard: CanDeactivateFn<CanComponentDeactivate> = (component: CanComponentDeactivate) => {
    return component.canDeactivate ? component.canDeactivate() : true;
};
