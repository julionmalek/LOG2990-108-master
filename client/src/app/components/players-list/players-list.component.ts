import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements OnChanges {
    @Input() playerslist: Player[];
    displayedColumns: string[] = ['name', 'points'];
    dataSource: Player[];
    allPlayers: Map<string, Player> = new Map();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.playerslist) {
            this.playerslist.forEach((player) => {
                const existingPlayer = this.allPlayers.get(player.name);
                if (existingPlayer) {
                    existingPlayer.points = player.points;
                    existingPlayer.isActive = true;
                } else {
                    this.allPlayers.set(player.name, { ...player, isActive: true });
                }
            });
            this.allPlayers.forEach((player, name) => {
                if (!this.playerslist.some((p) => p.name === name)) {
                    player.isActive = false;
                }
            });

            this.dataSource = Array.from(this.allPlayers.values());
        }
    }

    scoreNull(player: Player): boolean {
        if (player.points === 0) {
            return true;
        }
        return false;
    }
}
