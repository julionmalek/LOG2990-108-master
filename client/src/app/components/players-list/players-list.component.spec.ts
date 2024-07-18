/* eslint-disable @typescript-eslint/no-magic-numbers */
// These magic numbers are used for tests.
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayersListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should update allPlayers and dataSource on playerslist change', () => {
        const players = [
            { id: '234', submittedAnswerIndices: [0], ready: true, name: 'Player 3', points: 15, bonuses: 0 },
            { id: '345', submittedAnswerIndices: [0], ready: true, name: 'Player 4', points: 15, bonuses: 0 },
        ];
        const newPlayers = [
            { id: '123', submittedAnswerIndices: [0], ready: true, name: 'Player 1', points: 15, bonuses: 0 }, // Updated points
            { id: '136', submittedAnswerIndices: [0], ready: true, name: 'Player 2', points: 15, bonuses: 0 }, // New player
        ];

        component.playerslist = players;
        component.ngOnChanges({
            playerslist: new SimpleChange(null, component.playerslist, true),
        });

        // First change detection
        expect(component.allPlayers.size).toEqual(2);
        expect(component.dataSource.length).toEqual(2);

        // Updating players list
        component.playerslist = newPlayers;
        component.ngOnChanges({
            playerslist: new SimpleChange(players, newPlayers, false),
        });

        // Repeating to test the case where the players are already in the array.
        component.ngOnChanges({
            playerslist: new SimpleChange(players, newPlayers, false),
        });

        // Test after second change detection
        expect(component.allPlayers.size).toEqual(4);
        const player1 = component.dataSource.find((player) => player.name === 'Player 1');
        expect(player1?.points).toEqual(15);
        expect(component.dataSource.length).toEqual(4);
    });

    it('should mark players not in the new list as inactive', () => {
        const initialPlayers = [{ id: '123', submittedAnswerIndices: [0], ready: true, name: 'Player 1', points: 15, bonuses: 0 }];
        const newPlayers = [{ id: '136', submittedAnswerIndices: [0], ready: true, name: 'Player 2', points: 20, bonuses: 0 }];

        component.playerslist = initialPlayers;
        component.ngOnChanges({
            playerslist: new SimpleChange(null, component.playerslist, true),
        });

        // New playerslist without Player 1
        component.playerslist = newPlayers;
        component.ngOnChanges({
            playerslist: new SimpleChange(initialPlayers, newPlayers, false),
        });

        const player1 = Array.from(component.allPlayers.values()).find((p) => p.name === 'Player 1');
        expect(player1?.isActive).toBeFalsy();
    });

    it('should return true for players with 0 points', () => {
        const player = { id: '123', submittedAnswerIndices: [0], ready: true, name: 'Player 1', points: 0, bonuses: 0 };
        expect(component.scoreNull(player)).toBeTruthy();
    });

    it('should return false for players with more than 0 points', () => {
        const player = { id: '123', submittedAnswerIndices: [0], ready: true, name: 'Player 1', points: 15, bonuses: 0 };
        expect(component.scoreNull(player)).toBeFalsy();
    });
});
