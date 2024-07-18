import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Navigation, Router } from '@angular/router';
import { Player } from '@app/interfaces/player';
import { Quiz } from '@app/interfaces/quiz';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit, OnDestroy {
    private state: {
        playerList: Player[];
        histogramData: { [key: string]: number }[];
        quiz: Quiz;
    };

    constructor(private injector: Injector) {
        const navigation: Navigation | null = this.injector.get(Router).getCurrentNavigation();
        this.state = navigation?.extras.state as {
            playerList: Player[];
            histogramData: { [key: string]: number }[];
            quiz: Quiz;
        };
    }

    get playerList() {
        return this.state.playerList;
    }

    get histogramData() {
        return this.state.histogramData;
    }

    get quiz() {
        return this.state.quiz;
    }

    ngOnInit(): void {
        this.injector.get(SidebarService).openChat();
        this.injector.get(DirectNavigationService).revokeAccess();
    }

    ngOnDestroy(): void {
        this.injector.get(SidebarService).closeChat();
    }
}
