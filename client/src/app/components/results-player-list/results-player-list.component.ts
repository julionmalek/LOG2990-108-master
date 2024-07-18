import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Player } from '@app/interfaces/player';
@Component({
    selector: 'app-results-player-list',
    templateUrl: './results-player-list.component.html',
    styleUrls: ['./results-player-list.component.scss'],
})
export class ResultsPlayerListComponent implements OnInit, AfterViewInit {
    @Input() playerList: Player[];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    playerResults: Player[];
    displayedColumns: string[] = ['name', 'points', 'firstAnswers'];
    dataSource = new MatTableDataSource<Player>([]);

    ngOnInit(): void {
        const sortedResults: Player[] = this.sortResults(this.playerList);
        this.playerResults = sortedResults;
        this.dataSource.data = sortedResults;
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getPodiumClass(index: number): string {
        switch (index) {
            case 0:
                return 'gold';
            case 1:
                return 'silver';
            case 2:
                return 'bronze';
            default:
                return '';
        }
    }

    sortResults(resultArray: Player[]): Player[] {
        return resultArray.sort((a, b) => {
            if (a.points !== b.points) {
                return b.points - a.points;
            }
            return a.name.localeCompare(b.name);
        });
    }
}
