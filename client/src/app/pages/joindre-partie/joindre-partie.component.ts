import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service/data.service';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';

@Component({
    selector: 'app-joindre-partie',
    templateUrl: './joindre-partie.component.html',
    styleUrls: ['./joindre-partie.component.scss'],
})
export class JoindrePartieComponent {
    accessCode: string = '';
    playerName: string = '';
    errorMessage: string = '';

    constructor(private injector: Injector) {}

    joinGame() {
        if (!this.playerName.trim()) {
            this.displayError('Le nom du joueur ne peut pas être vide. Veuillez entrer un nom.');
            return;
        }
        if (this.isForbiddenPlayerName(this.playerName)) {
            this.displayError("Le nom 'Organisateur' et ses variantes ne sont pas autorisés. Veuillez choisir un autre nom.");
            return;
        }
        const accessCodeLength = 4;
        if (this.accessCode.length !== accessCodeLength) {
            this.displayError("Le code d'accès doit être composé de 4 chiffres.");
            return;
        } else {
            this.injector
                .get(DataService)
                .validateGameId(this.accessCode)
                .subscribe({
                    next: (response) => {
                        if (response.body?.isValid) {
                            this.injector.get(WebsocketService).setPlayerName(this.playerName);
                            this.injector.get(WebsocketService).requestJoinRoomValidation(this.accessCode, this.playerName);
                            this.injector
                                .get(WebsocketService)
                                .listenForJoinError()
                                .subscribe({
                                    next: (error) => {
                                        this.displayError(error.message);
                                    },
                                });
                            this.injector
                                .get(WebsocketService)
                                .onJoinConfirmed()
                                .subscribe(() => {
                                    this.injector.get(DirectNavigationService).grantAccess();
                                    this.injector.get(Router).navigate(['/waiting-page', this.accessCode]);
                                });
                        } else {
                            this.displayError('Le code est invalide ou la partie est verrouillée.');
                        }
                    },
                    error: () => {
                        this.displayError('Une erreur est survenue. Veuillez réessayer.');
                    },
                });
        }
    }
    private isForbiddenPlayerName(playerName: string): boolean {
        const forbiddenName = 'organisateur';
        return playerName.toLowerCase() === forbiddenName.toLowerCase();
    }
    private displayError(message: string) {
        this.errorMessage = message;
    }
}
