import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-select-page',
    templateUrl: './game-select-page.component.html',
    styleUrls: ['./game-select-page.component.scss'],
})
export class GameSelectPageComponent implements OnInit, OnDestroy {
    quizzes: Quiz[] = [];
    questions: Question[] = [];
    destroy$: Subject<void> = new Subject<void>();
    constructor(
        private dataService: DataService,
        private injector: Injector,
    ) {}

    ngOnInit(): void {
        this.fetchQuizzes();
        this.fetchQuestions();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
                error: () => {
                    {
                        this.injector.get(MatSnackBar).open('Erreur lors du chargement des quiz. Veuillez reessayer plus tard.', '', {
                            duration: 5000,
                        });
                    }
                },
            });
    }

    fetchQuestions(): void {
        this.dataService
            .fetchQuestions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.body) {
                        this.questions = response.body;
                    }
                },
                error: () => {
                    {
                        this.injector.get(MatSnackBar).open('Erreur lors du chargement des questions. Veuillez reessayer plus tard.', '', {
                            duration: 5000,
                        });
                    }
                },
            });
    }
}
