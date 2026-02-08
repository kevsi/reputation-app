import { scrapingWorker } from '@/infrastructure/worker/scraping.worker';
import {
    startScrapingScheduler,
    startCleanupScheduler,
    startStatsScheduler
} from './schedulers/scraping.scheduler';
import { startArchivingScheduler } from './schedulers/archiving.scheduler';
import { logger } from '@/infrastructure/logger';
import { prisma } from '@/shared/database/prisma.client';
import { getRedisClient } from '@/config/redis';

/**
 * 🚀 Workers Entry Point
 *
 * Démarre tous les workers et schedulers
 */
async function startWorkers() {
    logger.info('🚀 Starting Sentinelle Workers...');

    try {
        // Vérifier la connexion à la DB
        await prisma.$connect();
        logger.info('✅ Database connected');

        // Vérifier la connexion à Redis
        const redis = await getRedisClient();
        await redis.ping();
        logger.info('✅ Redis connected');

        // Démarrer le worker de scraping
        logger.info('✅ Scraping worker started (concurrency: 3)');

        // Démarrer les schedulers
        startScrapingScheduler();
        startCleanupScheduler();
        startStatsScheduler();
        startArchivingScheduler();

        logger.info('🎉 All workers and schedulers started successfully');

        // Afficher les infos de configuration
        logger.info('⚙️ Configuration:', {
            nodeEnv: process.env.NODE_ENV,
            redisUrl: process.env.REDIS_URL,
            workerConcurrency: 3
        });

    } catch (error) {
        logger.error('❌ Failed to start workers:', error);
        process.exit(1);
    }
}

/**
 * 🛑 Graceful Shutdown
 */
async function shutdown() {
    logger.info('🛑 Shutting down workers...');

    try {
        // Fermer le worker (attend que les jobs en cours se terminent)
        await scrapingWorker.close();
        logger.info('✅ Scraping worker closed');

        // Fermer les connexions
        await prisma.$disconnect();
        logger.info('✅ Database disconnected');

        const redis = await getRedisClient();
        await redis.quit();
        logger.info('✅ Redis disconnected');

        logger.info('👋 Workers shut down successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Gérer les signaux de terminaison
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Gérer les erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    shutdown();
});

// Démarrer les workers
startWorkers().catch((error) => {
    logger.error('❌ Fatal error starting workers:', error);
    process.exit(1);
});
