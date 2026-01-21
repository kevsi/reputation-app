import Queue from 'bull';
import { config } from '@/config/app';

/**
 * Queue "scraping" (Bull v4) compatible with `workers/src/lib/queues.ts`.
 * This allows the API to trigger scraping immediately (MVP) without waiting for cron.
 */

const redisAuth = config.REDIS_PASSWORD ? `:${encodeURIComponent(config.REDIS_PASSWORD)}@` : '';
const REDIS_URL = `redis://${redisAuth}${config.REDIS_HOST}:${config.REDIS_PORT}`;

export const scrapingQueue = new Queue('scraping', REDIS_URL);

