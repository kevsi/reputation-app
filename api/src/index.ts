import 'module-alias/register';
// ... reste du code
import { createApp } from './app';
import { startServer } from './server';
import { Logger } from './shared/logger';

const bootstrap = async () => {
  try {
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