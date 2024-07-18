import { HttpStatusCode } from '@angular/common/http';
import { Component, EventEmitter, Injector, Input, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportedQuiz } from '@app/interfaces/exported-quiz';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { saveAs } from 'file-saver-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { PopupComponent } from 'src/app/components/popup/popup.component';

@Component({
    selector: 'app-quiz-card',
    templateUrl: './quiz-card.component.html',
    styleUrls: ['./quiz-card.component.scss'],
})
export class QuizCardComponent implements OnDestroy {
    @Input() isAdminView: boolean = false;
    @Input() quiz: Quiz;
    @Output() fetchNeeded: EventEmitter<void> = new EventEmitter();
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private injector: Injector,
        private dataService: DataService,
    ) {}

    delete(): void {
        const confirmDialogRef = this.injector.get(MatDialog).open(ConfirmDialogComponent, {
            data: {
                header: 'Supprimer le quiz',
                content: 'Voulez-vous supprimer le quiz? Cette action est permanente.',
                confirmLabel: 'Oui',
                cancelLabel: 'Non',
            },
        });

        confirmDialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (result) {
                    this.dataService
                        .deleteQuiz(this.quiz.id ? this.quiz.id : '')
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: () => {
                                this.fetchNeeded.emit();
                            },
                            error: (error) => {
                                this.injector.get(MatSnackBar).open(error.error, '', {
                                    duration: 5000,
                                    panelClass: ['warn-snackbar'],
                                });
                            },
                        });
                }
            });
    }

    toggleHidden(): void {
        this.dataService
            .toggleQuizHidden(this.quiz.id ? this.quiz.id : '', this.quiz.hidden)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.fetchNeeded.emit();
                },
                error: (error) => {
                    if (error.status === HttpStatusCode.NotFound) {
                        this.injector
                            .get(MatSnackBar)
                            .open('Ce questionnaire a été supprimé. Veuillez sélectionner un autre questionnaire dans la liste.', '', {
                                duration: 5000,
                                panelClass: ['quiz-snackbar'],
                            });

                        this.fetchNeeded.emit();
                    }
                },
            });
    }

    download(): void {
        const dataToExport: ExportedQuiz = {
            id: this.quiz.id ? this.quiz.id : '',
            title: this.quiz.title,
            description: this.quiz.description,
            duration: this.quiz.duration,
            lastModification: this.quiz.lastModification,
            questions: this.quiz.questions.map((question) => ({
                type: question.type,
                text: question.text,
                points: question.points,
                choices: question.choices.map((choice) => ({
                    text: choice.text,
                    isCorrect: choice.isCorrect,
                })),
            })),
        };

        const quizJson = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([quizJson], { type: 'application/json' });
        saveAs(blob, `${dataToExport.title}.json`);
    }

    click(): void {
        this.dataService
            .fetchQuizById(this.quiz.id ? this.quiz.id : '')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.body && response.body.hidden) {
                        this.injector
                            .get(MatSnackBar)
                            .open('Ce questionnaire a été caché. Veuillez sélectionner un autre questionnaire dans la liste.', '', {
                                duration: 5000,
                                panelClass: ['quiz-snackbar'],
                            });

                        this.fetchNeeded.emit();
                    } else {
                        const popupRef = this.injector.get(MatDialog).open(PopupComponent, {
                            data: this.quiz,
                        });

                        popupRef
                            .afterClosed()
                            .pipe(takeUntil(this.destroy$))
                            .subscribe((result) => {
                                if (result && result.refetchQuizzes) {
                                    this.fetchNeeded.emit();
                                }
                            });
                    }
                },
                error: (error) => {
                    if (error.status === HttpStatusCode.NotFound) {
                        this.injector
                            .get(MatSnackBar)
                            .open('Ce questionnaire a été supprimé. Veuillez sélectionner un autre questionnaire dans la liste.', '', {
                                duration: 5000,
                                panelClass: ['quiz-snackbar'],
                            });

                        this.fetchNeeded.emit();
                    }
                },
            });
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
