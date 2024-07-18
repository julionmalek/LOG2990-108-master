import { TestBed } from '@angular/core/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
    let service: SidebarService;
    let sidenavMock: jasmine.SpyObj<MatSidenav>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SidebarService],
        });
        service = TestBed.inject(SidebarService);

        sidenavMock = jasmine.createSpyObj('MatSidenav', ['toggle', 'open', 'close']);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should toggle the sidebar', () => {
        // Set the sidebar before toggling
        service.setSidebar(sidenavMock);

        service.toggle();
        expect(sidenavMock.toggle).toHaveBeenCalled();
    });

    it('should close the sidebar', () => {
        sidenavMock = jasmine.createSpyObj('MatSidenav', ['toggle', 'close']);

        service.setSidebar(sidenavMock);

        service.close();
        expect(sidenavMock.close).toHaveBeenCalled();
    });

    it('should set chat', () => {
        service.setChat(sidenavMock);
        expect(service['chat']).toEqual(sidenavMock);
    });

    it('should return observable', () => {
        expect(service.getChatOpenState()).toEqual(jasmine.any(Observable));
    });

    it('should open chat', () => {
        service['chat'] = sidenavMock;
        spyOn(service['isChatOpen'], 'next');
        service.openChat();
        expect(service['chat'].open).toHaveBeenCalled();
        expect(service['isChatOpen'].next).toHaveBeenCalledWith(true);
    });

    it('should close chat', () => {
        service['chat'] = sidenavMock;
        spyOn(service['isChatOpen'], 'next');
        service.closeChat();
        expect(service['chat'].close).toHaveBeenCalled();
        expect(service['isChatOpen'].next).toHaveBeenCalledWith(false);
    });
});
