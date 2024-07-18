import { Component } from '@angular/core';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
    constructor(private sidebarService: SidebarService) {}

    clickMenu(): void {
        this.sidebarService.toggle();
    }
}
