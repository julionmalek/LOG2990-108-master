import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SharedService {
    private questionSource = new BehaviorSubject<Question | null>(null);

    get currentQuestion(): Observable<Question | null> {
        return this.questionSource.asObservable();
    }
    changeQuestion(question: Question): void {
        this.questionSource.next(question);
    }
}
