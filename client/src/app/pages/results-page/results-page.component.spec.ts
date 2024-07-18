import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { Navigation, Router, UrlTree } from '@angular/router';
import { DirectNavigationService } from '@app/services/direct-navigation.service/direct-navigation.service';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { ResultsPageComponent } from './results-page.component';
describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    let mockSidebarService: jasmine.SpyObj<SidebarService>;
    let mockChat: jasmine.SpyObj<MatSidenav>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockDirectNavigationService: jasmine.SpyObj<DirectNavigationService>;

    beforeEach(() => {
        mockSidebarService = jasmine.createSpyObj('SidebarService', ['open', 'close', 'getChatOpenState', 'openChat', 'closeChat']);
        mockChat = jasmine.createSpyObj('MatSidenav', ['open', 'close']);
        mockRouter = jasmine.createSpyObj('Router', ['getCurrentNavigation', 'createUrlTree']);
        mockDirectNavigationService = jasmine.createSpyObj('DirectNavigationService', ['revokeAccess']);

        TestBed.configureTestingModule({
            declarations: [ResultsPageComponent],
            providers: [
                { provide: SidebarService, useValue: mockSidebarService },
                { provide: Router, useValue: mockRouter },
                { provide: DirectNavigationService, useValue: mockDirectNavigationService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        mockRouter.createUrlTree.and.returnValue({} as UrlTree);
        mockRouter.getCurrentNavigation.and.returnValue({
            id: 1, // Mock navigation ID
            initialUrl: mockRouter.createUrlTree(['/']), // Mock initial URL
            extractedUrl: mockRouter.createUrlTree([]), // Mock extracted URL
            trigger: 'imperative', // Mock trigger
            previousNavigation: null, // Mock previousNavigation
            extras: {
                state: {
                    playerList: [],
                    histogramData: [],
                    quiz: {},
                },
            },
        } as Navigation);

        mockSidebarService.openChat.and.callFake(mockChat.open);
        mockSidebarService.closeChat.and.callFake(mockChat.close);

        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
