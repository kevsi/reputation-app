import 'module-alias/register';
// ... reste du code
import { createApp } from './app';
import { startServer } from './server';
import { logger } from '@/infrastructure/logger';

const bootstrap = async () => {
  try {
    // Créer l'application Express
    const app = createApp();
    
    // Démarrer le serveur
    startServer(app);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Démarrer l'application
bootstrap();