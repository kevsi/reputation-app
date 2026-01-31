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

const scrapingQueue = new Queue('scraping', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

logger.info(`✅ Scraping queue connected to Redis at ${url.hostname}`);

export { scrapingQueue };

