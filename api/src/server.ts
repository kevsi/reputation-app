import http from 'http';
import { Application } from 'express';
import { config } from './config/app';
import { logger } from './infrastructure/logger';

export const startServer = (app: Application): http.Server => {
  const server = http.createServer(app);

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      
      // Close database connections, redis, etc.
      // TODO: Add cleanup logic here
      
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Start server
  server.listen(config.PORT, () => {
    logger.info(`
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