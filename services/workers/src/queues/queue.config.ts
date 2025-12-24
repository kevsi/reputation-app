import Queue from 'bull';
import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

export const setupQueues = () => {
  // Analysis Queue - Analyse des mentions par IA
  const analysisQueue = new Queue('analysis', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  // Reports Queue - Génération de rapports PDF
  const reportsQueue = new Queue('reports', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 2,
      backoff: 5000,
      removeOnComplete: true,
    },
  });

  // Notifications Queue - Envoi email/SMS
  const notificationsQueue = new Queue('notifications', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'fixed',
        delay: 3000,
      },
      removeOnComplete: true,
    },
  });

  // Cleanup Queue - Nettoyage données anciennes
  const cleanupQueue = new Queue('cleanup', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: true,
    },
  });

  // Aggregation Queue - Calculs statistiques
  const aggregationQueue = new Queue('aggregation', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 2,
      backoff: 5000,
      removeOnComplete: true,
    },
  });

  return {
    analysisQueue,
    reportsQueue,
    notificationsQueue,
    cleanupQueue,
    aggregationQueue,
  };
};