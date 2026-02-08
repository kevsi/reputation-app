/**
 * Worker de scraping BullMQ
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { Worker, Job } from 'bullmq';
import { redisConnection } from '@/config/redis';
import { processScrapingJob } from '@/workers/processors/scraping.processor';
import { logger } from '@/infrastructure/logger';

const connection = {
  host: redisConnection.host,
  port: redisConnection.port,
  password: redisConnection.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const scrapingWorker = new Worker(
  'scraping',
  async (job: Job) => {
    logger.info(`Processing scraping job ${job.id} for source ${job.data.sourceId}`);

    try {
      const result = await processScrapingJob(job);
      return result;
    } catch (error) {
      logger.error(`Scraping job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.SCRAPING_CONCURRENCY || '5'),
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

scrapingWorker.on('completed', (job) => {
  logger.info(`Worker completed job ${job.id}`);
});

scrapingWorker.on('failed', (job, err) => {
  logger.error(`Worker failed job ${job?.id}:`, err);
});

scrapingWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down scraping worker...');
  await scrapingWorker.close();
});
