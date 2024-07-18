import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('sidebar') sidebar: MatSidenav;
    @ViewChild('chat') chatSidebar: MatSidenav;
    isChatOpen: boolean = false;
    private chatOpenSubscription: Subscription;

    constructor(
        private sidebarService: SidebarService,
        private cdRef: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.sidebarService.setSidebar(this.sidebar);
        this.sidebarService.setChat(this.chatSidebar);
    }

    ngOnInit(): void {
        this.chatOpenSubscription = this.sidebarService.getChatOpenState().subscribe((isOpen) => {
            this.isChatOpen = isOpen;
            this.cdRef.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.chatOpenSubscription.unsubscribe();
    }

    chatOpened() {
        if (this.chatSidebar) {
            return this.chatSidebar.opened;
        } else {
            return false;
        }
    }
}
