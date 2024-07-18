import { TestBed } from '@angular/core/testing';

import { RoomService } from './room.service';

describe('RoomService', () => {
    let service: RoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RoomService);
        sessionStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setRoomId and #getRoomId should set and return the same room ID', () => {
        const testRoomId = '12345';
        service.setRoomId(testRoomId);
        expect(service.getRoomId()).toBe(testRoomId);
    });

    it('#setIsOrganizer and #getIsOrganizer should set and return the same organizer status', () => {
        service.setIsOrganizer(true);
        expect(service.getIsOrganizer()).toBeTrue();

        service.setIsOrganizer(false);
        expect(service.getIsOrganizer()).toBeFalse();
    });

    it('#setCurrentPlayer and #getCurrentPlayer should set and return the same player', () => {
        const testPlayer = { id: '1', name: 'Test Player' };
        service.setCurrentPlayer(testPlayer);
        expect(service.getCurrentPlayer()).toEqual(testPlayer);
    });

    it('#getCurrentPlayer should retrieve player data from sessionStorage if not set in service', () => {
        const testPlayer = { id: '2', name: 'Another Test Player' };
        sessionStorage.setItem('currentPlayer', JSON.stringify(testPlayer));
        expect(service.getCurrentPlayer()).toEqual(testPlayer);
    });

    it('should return null if playerData is null', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue(null);
        expect(service.getCurrentPlayer()).toBeNull();
    });

    it('should clear currentPlayer from sessionStorage on setCurrentPlayer with null', () => {
        const testPlayer = { id: '3', name: 'Yet Another Test Player' };
        service.setCurrentPlayer(testPlayer);
        service.setCurrentPlayer(null);

        const playerData = sessionStorage.getItem('currentPlayer');
        expect(playerData).toBeNull();
    });
});
