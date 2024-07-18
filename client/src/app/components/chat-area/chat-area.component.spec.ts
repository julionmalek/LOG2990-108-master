/* eslint-disable @typescript-eslint/no-magic-numbers */
// These magic numbers are used for tests.
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '@app/services/room.service/room.service';
import { WebsocketService } from '@app/services/websocket.service/websocket.service';
import { of } from 'rxjs';
import { ChatAreaComponent } from './chat-area.component';

interface WebsocketServiceMock {
    onMessage: jasmine.Spy;
    onPastMessages: jasmine.Spy;
    sendMessage: jasmine.Spy;
    getPlayerName: jasmine.Spy;
}

interface FocusServiceMock {
    setInputFocusState: jasmine.Spy;
    getInputFocusState: jasmine.Spy;
}

interface RoomServiceMock {
    getRoomId: jasmine.Spy;
    getIsOrganizer: jasmine.Spy;
}

interface ActivatedRouteMock {
    snapshot: {
        paramMap: {
            get: jasmine.Spy;
        };
    };
}

describe('ChatAreaComponent', () => {
    let component: ChatAreaComponent;
    let fixture: ComponentFixture<ChatAreaComponent>;
    let websocketServiceMock: WebsocketServiceMock;
    let roomServiceMock: RoomServiceMock;
    let activatedRouteMock: ActivatedRouteMock;
    let focusServiceMock: FocusServiceMock;

    beforeEach(() => {
        websocketServiceMock = {
            onMessage: jasmine.createSpy().and.returnValue(of({ user: 'test', message: 'hello' })),
            onPastMessages: jasmine.createSpy().and.returnValue(of([{ user: 'test', message: 'past message' }])),
            sendMessage: jasmine.createSpy(),
            getPlayerName: jasmine.createSpy().and.returnValue('user'),
        };

        roomServiceMock = {
            getRoomId: jasmine.createSpy().and.returnValue('mockRoomId'),
            getIsOrganizer: jasmine.createSpy().and.returnValue(true),
        };

        activatedRouteMock = {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy().and.returnValue('mockGameId'),
                },
            },
        };

        focusServiceMock = {
            setInputFocusState: jasmine.createSpy(),
            getInputFocusState: jasmine.createSpy().and.returnValue(true),
        };

        TestBed.configureTestingModule({
            declarations: [ChatAreaComponent],
            providers: [
                { provide: WebsocketService, useValue: websocketServiceMock },
                { provide: RoomService, useValue: roomServiceMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(ChatAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle incoming and past messages', () => {
        expect(component.messages.length).toBeGreaterThan(0);
        expect(websocketServiceMock.onMessage).toHaveBeenCalled();
        expect(websocketServiceMock.onPastMessages).toHaveBeenCalled();
    });

    it('should not call sendMessage if newMessage.message is empty', () => {
        component.newMessage = { user: 'user', message: '' };
        component.sendMessage();
        expect(websocketServiceMock.sendMessage).not.toHaveBeenCalled();
    });

    it('should call sendMessage when a new message is sent', () => {
        const testMessage = 'Test message';
        component.newMessage = { user: 'user', message: testMessage };
        component.sendMessage();
        expect(websocketServiceMock.sendMessage).toHaveBeenCalledWith(
            {
                user: websocketServiceMock.getPlayerName(),
                message: testMessage,
                isOrganizer: true,
            },
            'mockRoomId',
        );
    });

    it('should update message and check character limit', () => {
        const testMessage = 'a'.repeat(component.maxMessageLength);
        component.checkCharacterLimit(testMessage);
        expect(component.characterLimitExceeded).toBeTruthy();
        const event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(event, 'target', {
            writable: false,
            value: { value: 'Test message' },
        });

        component.updateMessage(event);
        expect(component.newMessage.message).toEqual('Test message');
    });

    it('should adjust chat header based on organizer status', () => {
        expect(component.chatHeaderTitle).toEqual('Organizer');
    });

    it('should set chatHeaderTitle to "Organizer" if user is an organizer', () => {
        roomServiceMock.getIsOrganizer.and.returnValue(true);
        fixture = TestBed.createComponent(ChatAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // This triggers ngOnInit

        expect(component.chatHeaderTitle).toEqual('Organizer');
    });

    it('should set focus', () => {
        component.setFocus(true);
        expect(focusServiceMock.getInputFocusState()).toBeTruthy();
    });

    it('should set chatHeaderTitle to "Organizer" if the user is an organizer', () => {
        roomServiceMock.getIsOrganizer.and.returnValue(true); // User is an organizer
        component.initializeChatHeaderTitle();
        expect(component.chatHeaderTitle).toEqual('Organizer');
    });

    it("should set chatHeaderTitle to player's name if the user is not an organizer", () => {
        roomServiceMock.getIsOrganizer.and.returnValue(false);
        component.initializeChatHeaderTitle();
        expect(component.chatHeaderTitle).toEqual('user');
    });
});
