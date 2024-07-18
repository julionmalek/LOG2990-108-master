import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '@app/interfaces/question';
import { DataService } from '@app/services/data.service/data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-question-selector',
    templateUrl: './question-selector.component.html',
    styleUrls: ['./question-selector.component.scss'],
})
export class QuestionSelectorComponent implements OnInit, OnDestroy {
    questions: Question[];
    selectedQuestion?: Question;
    errorVisible: boolean = false;
    destroy$: Subject<void> = new Subject<void>();

    constructor(
        private dataService: DataService,
        private dialogRef: MatDialogRef<QuestionSelectorComponent>,
        private injector: Injector,
    ) {}

    ngOnInit(): void {
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
                    this.injector.get(MatSnackBar).open('Erreur lors du chargement des questions. Veuillez reeassayer plus tard.', '', {
                        duration: 5000,
                    });
                },
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    selectQuestion(question: Question): void {
        this.selectedQuestion = question;
        this.errorVisible = false;
    }

    confirmSelection(): void {
        if (this.selectedQuestion) {
            this.dialogRef.close(this.selectedQuestion);
        } else {
            this.errorVisible = true;
        }
    }
}
