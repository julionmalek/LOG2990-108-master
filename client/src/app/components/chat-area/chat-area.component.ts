import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FocusService } from '@app/services/focus.service/focus.service';
import { RoomService } from '@app/services/room.service/room.service';
import { Message, WebsocketService } from '@app/services/websocket.service/websocket.service';

@Component({
    selector: 'app-chat-area',
    templateUrl: './chat-area.component.html',
    styleUrls: ['./chat-area.component.scss'],
})
export class ChatAreaComponent implements OnInit, AfterViewInit {
    @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLDivElement>;
    messages: Message[] = [];
    newMessage: Message = { user: '', message: '' };
    showChat: boolean = false;
    gameId: string;
    currentUser: string;
    chatHeaderTitle: string = 'Chat'; // Default title
    characterLimitExceeded = false;
    readonly maxMessageLength = 200;
    readonly timeOutTime = 100;
    constructor(
        private websocketService: WebsocketService,
        private roomService: RoomService,
        private focusService: FocusService,
    ) {}

    ngOnInit() {
        this.initializeChatHeaderTitle();
        this.websocketService.onMessage().subscribe((message: Message) => {
            this.messages.push(message);
        });

        this.websocketService.onPastMessages().subscribe((pastMessages: Message[]) => {
            this.messages = [...pastMessages, ...this.messages];
        });
    }

    ngAfterViewInit(): void {
        this.gameId = this.roomService.getRoomId();
        this.scrollToBottom();
    }

    setFocus(focus: boolean): void {
        this.focusService.setInputFocusState(focus);
    }

    checkCharacterLimit(value: string): void {
        this.characterLimitExceeded = value.length === this.maxMessageLength;
    }

    updateMessage(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.newMessage.message = target.value;
    }

    sendMessage(): void {
        this.gameId = this.roomService.getRoomId();
        if (this.newMessage.message.trim()) {
            const trimmedMessage = this.newMessage.message.slice(0, this.maxMessageLength);

            const messageToSend: Message = {
                user: this.websocketService.getPlayerName(), // Use the player's name or ID
                message: trimmedMessage,
                isOrganizer: this.roomService.getIsOrganizer(),
            };
            this.websocketService.sendMessage(messageToSend, this.gameId);
            this.newMessage = { user: '', message: '' };
            this.scrollToBottom();
        }
    }

    initializeChatHeaderTitle(): void {
        const isOrganizer = this.roomService.getIsOrganizer();
        if (isOrganizer) {
            this.chatHeaderTitle = 'Organizer';
        } else {
            this.chatHeaderTitle = this.websocketService.getPlayerName();
        }
    }

    scrollToBottom(): void {
        setTimeout(() => {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
            if (this.messagesContainer && this.messagesContainer.nativeElement) {
                this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
            }
        }, this.timeOutTime);
    }
}
