import { Application } from '@app/app';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { Database } from './database';
import { SocketManager } from './services/socket-manager.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private socketManager: SocketManager;

    constructor(private readonly application: Application) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        return isNaN(port) ? val : port >= 0 ? port : false;
    }
    init(): void {
        Database.connect();
        this.application.app.set('port', Server.appPort);
        this.server = http.createServer(this.application.app);

        this.socketManager = new SocketManager(this.server);
        this.socketManager.handleSockets();

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
    }
    getSocketManager(): SocketManager {
        return this.socketManager;
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // utilisé pour afficher un message d'erreur indiquant que le port nécessite des privilèges élevés.
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // utilisé pour afficher un message d'erreur indiquant que le port ou le pipe est déjà utilisé
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // utilisé pour indiquer que le serveur écoute sur le port ou le pipe spécifié.
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
