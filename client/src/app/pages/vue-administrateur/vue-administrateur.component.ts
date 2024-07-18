import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
    selector: 'app-vue-administrateur',
    templateUrl: './vue-administrateur.component.html',
    styleUrls: ['./vue-administrateur.component.scss'],
})
export class VueAdministrateurComponent implements OnInit, OnDestroy {
    quizzes: Quiz[] = [];
    questions: Question[] = [];
    destroy$: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        this.fetchQuizzes();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    async redirectBanquequiz(): Promise<void> {
        this.router.navigate(['question-bank'], { queryParams: { newQuestion: 'true' } });
    }

    fetchQuizzes(): void {
        this.dataService
            .fetchQuiz()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.body) {
                        this.quizzes = response.body;
                    }
                },
            });
    }
}
