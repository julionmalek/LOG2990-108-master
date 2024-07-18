import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service/data.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { of, throwError } from 'rxjs';
import { JoindrePartieComponent } from './joindre-partie.component';

describe('JoindrePartieComponent', () => {
    let component: JoindrePartieComponent;
    let fixture: ComponentFixture<JoindrePartieComponent>;
    let dataServiceMock: jasmine.SpyObj<DataService>;
    let routerMock: jasmine.SpyObj<Router>;
    let websocketServiceMock: jasmine.SpyObj<WebsocketService>;

    beforeEach(async () => {
        dataServiceMock = jasmine.createSpyObj('DataService', ['validateGameId']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        websocketServiceMock = jasmine.createSpyObj('WebsocketService', [
            'setPlayerName',
            'requestJoinRoomValidation',
            'listenForJoinError',
            'onJoinConfirmed',
        ]);

        await TestBed.configureTestingModule({
            declarations: [JoindrePartieComponent],
            imports: [FormsModule],
            providers: [
                { provide: DataService, useValue: dataServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: WebsocketService, useValue: websocketServiceMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoindrePartieComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display an error if the player name is forbidden', () => {
        component.playerName = 'Organisateur';
        component.joinGame();
        expect(component.errorMessage).toContain("Le nom 'Organisateur' et ses variantes ne sont pas autorisés.");
    });

    it('should display an error if the player name is empty', () => {
        component.playerName = '';
        component.joinGame();
        expect(component.errorMessage).toContain('Le nom du joueur ne peut pas être vide. Veuillez entrer un nom.');
    });
    it('should display an error if the access code length is not 4 characters', () => {
        component.accessCode = '123';
        component.playerName = 'ValidName';
        component.joinGame();
        expect(component.errorMessage).toContain("Le code d'accès doit être composé de 4 chiffres.");
    });

    it('should display an error for invalid access code', () => {
        component.accessCode = '1234';
        component.playerName = 'ValidName';
        dataServiceMock.validateGameId.and.returnValue(
            of(
                new HttpResponse({
                    body: { isValid: false, message: 'Game ID not found.' },
                    status: 404,
                }),
            ),
        );
        component.joinGame();
        expect(component.errorMessage).toContain('Le code est invalide ou la partie est verrouillée.');
    });

    it('should navigate to waiting page on successful join', () => {
        component.accessCode = '1234';
        component.playerName = 'ValidName';
        dataServiceMock.validateGameId.and.returnValue(
            of(
                new HttpResponse({
                    body: { isValid: true },
                    status: 200,
                }),
            ),
        );
        websocketServiceMock.listenForJoinError.and.returnValue(of({ message: '' }));
        websocketServiceMock.onJoinConfirmed.and.returnValue(of(void 0));
        component.joinGame();

        expect(dataServiceMock.validateGameId).toHaveBeenCalledWith('1234');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/waiting-page', '1234']);
    });

    it('should handle DataService error gracefully', () => {
        component.accessCode = '1234';
        component.playerName = 'ValidName';
        dataServiceMock.validateGameId.and.returnValue(throwError(() => new Error('Service Error')));
        component.joinGame();
        expect(component.errorMessage).toContain('Une erreur est survenue. Veuillez réessayer.');
    });
});
