import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FocusService {
    isInputFocused$: Observable<boolean>;
    private focusedOnInput = new BehaviorSubject<boolean>(false);

    constructor() {
        this.isInputFocused$ = this.focusedOnInput.asObservable();
    }

    setInputFocusState(isFocused: boolean): void {
        this.focusedOnInput.next(isFocused);
    }
}
