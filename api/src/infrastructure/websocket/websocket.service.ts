import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../logger';

class WebSocketService {
    private io: SocketIOServer | null = null;
    private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

    /**
     * Initialise le service WebSocket
     */
    initialize(server: any) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventHandlers();
        logger.info('WebSocket service initialized');
    }

    /**
     * Configure les gestionnaires d'événements
     */
    private setupEventHandlers() {
        if (!this.io) return;

        this.io.on('connection', (socket: Socket) => {
            logger.info(`User connected: ${socket.id}`);

            // Authentification de l'utilisateur
            socket.on('authenticate', (userId: string) => {
                this.registerUserSocket(userId, socket.id);
                socket.join(`user:${userId}`);
                logger.info(`User ${userId} authenticated on socket ${socket.id}`);
            });

            // Déconnexion
            socket.on('disconnect', () => {
                this.unregisterUserSocket(socket.id);
                logger.info(`Socket disconnected: ${socket.id}`);
            });

            // Ping/Pong pour maintenir la connexion
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }

    /**
     * Enregistre un socket pour un utilisateur
     */
    private registerUserSocket(userId: string, socketId: string) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socketId);
    }

    /**
     * Désenregistre un socket
     */
    private unregisterUserSocket(socketId: string) {
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.has(socketId)) {
                sockets.delete(socketId);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
                break;
            }
        }
    }

    /**
     * Envoie un message à un utilisateur spécifique
     */
    async sendToUser(userId: string, event: string, data: any) {
        if (!this.io) {
            logger.warn('WebSocket not initialized');
            return;
        }

        // Vérifier si l'utilisateur a des sockets actifs
        const userSockets = this.userSockets.get(userId);
        if (!userSockets || userSockets.size === 0) {
            logger.debug(`No active sockets for user ${userId}`);
            return;
        }

        // Envoyer à tous les sockets de l'utilisateur
        this.io.to(`user:${userId}`).emit(event, data);
        logger.debug(`Sent ${event} to user ${userId}`);
    }

    /**
     * Envoie un message à tous les utilisateurs d'une organisation
     */
    async sendToOrganization(organizationId: string, event: string, data: any) {
        if (!this.io) {
            logger.warn('WebSocket not initialized');
            return;
        }

        this.io.to(`org:${organizationId}`).emit(event, data);
        logger.debug(`Sent ${event} to organization ${organizationId}`);
    }

    /**
     * Broadcast à tous les utilisateurs connectés
     */
    async broadcast(event: string, data: any) {
        if (!this.io) {
            logger.warn('WebSocket not initialized');
            return;
        }

        this.io.emit(event, data);
        logger.debug(`Broadcasted ${event} to all users`);
    }

    /**
     * Récupère le nombre d'utilisateurs connectés
     */
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    /**
     * Récupère les statistiques WebSocket
     */
    getStats() {
        const totalSockets = Array.from(this.userSockets.values())
            .reduce((sum, sockets) => sum + sockets.size, 0);

        return {
            connectedUsers: this.userSockets.size,
            totalSockets,
            userSockets: Object.fromEntries(
                Array.from(this.userSockets.entries()).map(([userId, sockets]) => [
                    userId,
                    sockets.size
                ])
            )
        };
    }
}

export const websocketService = new WebSocketService();