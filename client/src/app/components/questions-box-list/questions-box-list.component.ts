import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { DataService } from '@app/services/data.service/data.service';
import { SharedService } from '@app/services/shared.service/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-questions-box-list',
    templateUrl: './questions-box-list.component.html',
    styleUrls: ['./questions-box-list.component.scss'],
})
export class QuestionsBoxListComponent implements OnInit, OnDestroy {
    questions: Question[] = [];
    private destroy$: Subject<void> = new Subject<void>();

    constructor(private injector: Injector) {}
    ngOnInit(): void {
        this.injector
            .get(DataService)
            .fetchQuestions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.body) {
                        this.questions = response.body;
                    }
                },
                error: () => {
                    // handle error
                },
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    redirectToQuestionBank(): void {
        this.injector.get(Router).navigate(['/question-bank']);
    }

    deleteQuestion(index: number): void {
        const dialogRef = this.injector.get(MatDialog).open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                header: 'Supprimer la question',
                content: 'Êtes-vous sûr de vouloir supprimer cette question ?',
                confirmLabel: 'Oui',
                cancelLabel: 'Non',
            },
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (result) {
                    const questionId = this.questions[index].id;
                    if (questionId) {
                        this.injector
                            .get(DataService)
                            .deleteQuestion(questionId)
                            .pipe(takeUntil(this.destroy$))
                            .subscribe({
                                next: () => {
                                    this.questions.splice(index, 1);
                                },
                                error: () => {
                                    // handle error
                                },
                            });
                    }
                }
            });
    }

    editQuestion(index: number): void {
        const question = this.questions[index];
        this.injector.get(SharedService).changeQuestion(question);
        this.redirectToQuestionBank();
    }
}
