import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SidebarService {
    private sidebar: MatSidenav;
    private chat: MatSidenav;
    private isChatOpen = new BehaviorSubject<boolean>(false);

    setSidebar(sidebar: MatSidenav) {
        this.sidebar = sidebar;
    }

    setChat(chat: MatSidenav) {
        this.chat = chat;
    }

    toggle(): void {
        this.sidebar.toggle();
    }

    close(): void {
        this.sidebar.close();
    }

    openChat() {
        this.chat.open();
        this.isChatOpen.next(true);
    }

    closeChat() {
        if (this.chat) {
            this.chat.close();
            this.isChatOpen.next(false);
        }
    }

    getChatOpenState(): Observable<boolean> {
        return this.isChatOpen.asObservable();
    }
}
