import http from 'http';
import { Application } from 'express';
import { config } from './config/app';
import { Logger } from './shared/logger';
import { websocketService } from './infrastructure/websocket/websocket.service';
import { prisma } from './shared/database/prisma.client';

export const startServer = (app: Application): http.Server => {
  const server = http.createServer(app);

  // Initialize WebSocket service
  websocketService.initialize(server);

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    Logger.info(`${signal} reçu, arrêt du serveur en cours...`, { composant: 'Server', operation: 'gracefulShutdown', signal });

    server.close(async () => {
      Logger.info('Serveur HTTP arrêté', { composant: 'Server', operation: 'gracefulShutdown' });

      // Close database connections
      await prisma.$disconnect();
      Logger.info('Connexions à la base de données fermées', { composant: 'Server', operation: 'gracefulShutdown' });

      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      Logger.error('Arrêt forcé après expiration du délai', new Error('Timeout expired'), { composant: 'Server', operation: 'gracefulShutdown', timeout: 30000 });
      process.exit(1);
    }, 30000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    Logger.error('Exception non interceptée', error instanceof Error ? error : new Error(String(error)), { composant: 'Server', operation: 'uncaughtException' });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    Logger.error('Rejet de promesse non géré', error, { composant: 'Server', operation: 'unhandledRejection', reason, promise });
    process.exit(1);
  });

  // Start server
  server.listen(config.PORT, () => {
    Logger.info(`
╔════════════════════════════════════════════╗
║   🚀 Sentinelle-Reputation API Started    ║
╠════════════════════════════════════════════╣
║  Environment: ${config.NODE_ENV.padEnd(27)} ║
║  Port:        ${String(config.PORT).padEnd(27)} ║
║  API Version: ${config.API_VERSION.padEnd(27)} ║
║  URL:         http://localhost:${config.PORT}    ║
╚════════════════════════════════════════════╝
    `);
  });

  return server;
};