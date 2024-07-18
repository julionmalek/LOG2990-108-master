import { Observable } from 'rxjs';

export type CanDeactivateType = Observable<boolean> | boolean;

export interface CanComponentDeactivate {
    canDeactivate: () => CanDeactivateType;
}
