import { Injectable } from '@angular/core';

interface Player {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private roomId: string = '';
    private currentPlayer: Player | null;
    private isOrganizer: boolean = false;

    setRoomId(roomId: string) {
        this.roomId = roomId;
    }

    getRoomId(): string {
        return this.roomId;
    }

    setIsOrganizer(isOrganizer: boolean) {
        this.isOrganizer = isOrganizer;
    }

    getIsOrganizer(): boolean {
        return this.isOrganizer;
    }

    setCurrentPlayer(player: Player | null) {
        if (player) {
            this.currentPlayer = player;
            sessionStorage.setItem('currentPlayer', JSON.stringify(player));
        } else {
            this.currentPlayer = null;
            sessionStorage.removeItem('currentPlayer');
        }
    }

    getCurrentPlayer(): Player | null {
        if (!this.currentPlayer) {
            const playerData = sessionStorage.getItem('currentPlayer');
            this.currentPlayer = playerData ? JSON.parse(playerData) : null;
        }
        return this.currentPlayer;
    }
}
