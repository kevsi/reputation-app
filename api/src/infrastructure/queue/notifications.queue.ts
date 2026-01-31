import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(REDIS_URL);

const redisConfig = {
  host: url.hostname,
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
  maxRetriesPerRequest: null
};

const connection = new Redis(redisConfig);

const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

const cleanupQueue = new Queue('cleanup', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

// Mock workers for now (since we don't have worker logic here yet)
const notificationWorker = null;
const cleanupWorker = null;

// Fonction pour ajouter des jobs de nettoyage
export const scheduleCleanup = async (daysOld: number = 90) => {
  if (cleanupQueue && cleanupQueue.add) {
    await cleanupQueue.add(
      'cleanup-old-notifications',
      { daysOld },
      {
        repeat: {
          pattern: '0 2 * * *', // Tous les jours à 2h du matin
        },
      }
    );
  }
};

logger.info(`✅ Notifications queue connected to Redis at ${url.hostname}`);

export { notificationQueue, notificationWorker, cleanupWorker };