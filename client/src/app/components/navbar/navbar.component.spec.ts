import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarService } from '@app/services/sidebar.service/sidebar.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;
    const sidebarServiceMock = {
        toggle: jasmine.createSpy('toggle'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NavbarComponent],
            providers: [{ provide: SidebarService, useValue: sidebarServiceMock }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call SidebarService.toggle when clickMenu is called', () => {
        component.clickMenu();
        expect(sidebarServiceMock.toggle).toHaveBeenCalled();
    });
});
