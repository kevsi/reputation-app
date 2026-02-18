import 'module-alias/register';
// ... reste du code
import { createApp } from './app';
import { startServer } from './server';
import { Logger } from './shared/logger';
import './infrastructure/worker/scraping.worker';

const bootstrap = async () => {
  try {
    // Le worker de scraping s'initialise à l'import

    // Initialiser Redis
    const { getRedisClient } = await import('./config/redis');
    await getRedisClient();
    Logger.info('✅ Redis initialized');

    // Créer l'application Express
    const app = createApp();

    // Démarrer le serveur
    startServer(app);

  } catch (error) {
    Logger.error('Échec du démarrage du serveur', error as Error, { composant: 'Bootstrap', operation: 'startServer' });
    process.exit(1);
  }
};

// Démarrer l'application
bootstrap();