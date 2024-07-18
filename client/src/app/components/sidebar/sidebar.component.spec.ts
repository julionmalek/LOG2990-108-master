import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { of } from 'rxjs';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let sidebarServiceMock: jasmine.SpyObj<SidebarService>;

    beforeEach(async () => {
        sidebarServiceMock = jasmine.createSpyObj('SidebarService', ['toggle', 'setSidebar', 'setChat', 'getChatOpenState']);

        sidebarServiceMock.getChatOpenState.and.returnValue(of(true));
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [{ provide: SidebarService, useValue: sidebarServiceMock }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true if chatSidebar is open', () => {
        const chatSidenavMock = jasmine.createSpyObj('MatSidenav', [], { opened: true });
        component.chatSidebar = chatSidenavMock;

        expect(component.chatOpened()).toBe(true);
    });

    it('should return false if chatSidebar is not open', () => {
        const chatSidenavMock = jasmine.createSpyObj('MatSidenav', [], { opened: false });
        component.chatSidebar = chatSidenavMock;

        expect(component.chatOpened()).toBe(false);
    });

    it('should return false if chatSidebar is not set', () => {
        const changeDetectorRefMock = jasmine.createSpyObj('ChangeDetectorRef', [
            'detectChanges',
            'checkNoChanges',
            'reattach',
            'detach',
            'markForCheck',
        ]);
        const newComponent = new SidebarComponent(sidebarServiceMock, changeDetectorRefMock);

        expect(newComponent.chatOpened()).toBe(false);
    });
});
