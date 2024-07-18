import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';

export const directNavigationGuard: CanActivateFn = () => {
    return inject(DirectNavigationService).canNavigate() ? true : inject(Router).createUrlTree(['/joindre-partie']);
};
