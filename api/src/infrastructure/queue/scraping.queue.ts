/**
 * Queue de scraping BullMQ
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '@/config/redis';
import { logger } from '@/infrastructure/logger';

const connection = {
  host: redisConnection.host,
  port: redisConnection.port,
  password: redisConnection.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const scrapingQueue = new Queue('scraping', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600,
      count: 100,
    },
    removeOnFail: {
      age: 86400,
    },
  },
});

const queueEvents = new QueueEvents('scraping', { connection });

queueEvents.on('completed', ({ jobId }) => {
  logger.info(`Scraping job ${jobId} completed`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Scraping job ${jobId} failed: ${failedReason}`);
});

queueEvents.on('progress', ({ jobId, data }) => {
  logger.debug(`Scraping job ${jobId} progress: ${JSON.stringify(data)}`);
});

process.on('SIGTERM', async () => {
  await scrapingQueue.close();
  await queueEvents.close();
});
