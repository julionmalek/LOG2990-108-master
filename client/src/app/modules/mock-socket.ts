import { SocketEmit, SocketOn, SocketEventMap } from '@app/services/socket-event-types';

export class MockSocket {
    connected = false;
    private listeners: { [event: string]: ((data: unknown) => void)[] } = {};

    connect(): void {
        this.connected = true;
    }

    disconnect(): void {
        this.connected = false;
    }

    on: SocketOn<keyof SocketEventMap> = (event, callback) => {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback as (data: unknown) => void);
    };

    emit: SocketEmit<keyof SocketEventMap> = () => {
        // On peut simuler une réponse automatique pour certains événements
    };

    trigger<T extends keyof SocketEventMap>(event: T, data: SocketEventMap[T]): void {
        this.listeners[event]?.forEach((callback) => callback(data));
    }
}
