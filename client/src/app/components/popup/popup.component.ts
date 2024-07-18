import { Component, Inject, Injector, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnDestroy {
    activeGameIds = new Set<string>();
    destroy$: Subject<void> = new Subject<void>();
    constructor(
        private injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public quiz: Quiz,
    ) {
        this.quiz.questions.forEach((question) => (question.showChoices = false));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleQuestionChoices(question: Question): void {
        question.showChoices = !question.showChoices;
    }

    exitDialog(exitValue?: { refetchQuizzes: boolean }): void {
        this.injector.get(MatDialogRef<PopupComponent>).close(exitValue);
    }

    redirectToWaitingPage(): void {
        this.injector
            .get(DataService)
            .createGame()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const gameId = response.body?.gameId;
                    if (gameId) {
                        this.injector.get(WebsocketService).isOrganizer = true;
                        this.injector.get(WebsocketService).setPlayerName('Organisateur');
                        this.injector.get(WebsocketService).createRoom(gameId, this.quiz);
                        this.injector.get(DirectNavigationService).grantAccess();
                        this.injector.get(Router).navigate(['/waiting-page', gameId]);
                        this.injector.get(SidebarService).close();
                        this.exitDialog({ refetchQuizzes: false });
                    }
                },
                error: () => {
                    this.injector.get(MatSnackBar).open('Erreur lors de la creation de la partie. Veuillez reessayer plus tard.', '', {
                        duration: 5000,
                    });

                    this.exitDialog({ refetchQuizzes: true });
                },
            });
    }

    redirectToTestGamePage(): void {
        this.injector.get(WebsocketService).reset();

        this.injector
            .get(WebsocketService)
            .connected$.pipe(takeUntil(this.destroy$))
            .subscribe((connected) => {
                if (connected) {
                    const socketId = this.injector.get(WebsocketService).socketId;
                    this.injector.get(WebsocketService).createTestRoom(this.quiz);
                    this.injector.get(DirectNavigationService).grantAccess();
                    this.injector.get(Router).navigate(['/game-page', socketId], { state: { mode: 'testing' } });
                    this.injector.get(SidebarService).close();
                    this.exitDialog({ refetchQuizzes: false });
                }
            });
    }
}
