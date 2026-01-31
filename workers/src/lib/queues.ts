import { Queue } from 'bullmq';

console.log('REDIS_URL from env before parsing:', process.env.REDIS_URL);

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL
const url = new URL(REDIS_URL);
const redisConfig = {
  host: url.hostname,
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
};

console.log('Parsed Redis connection:', redisConfig);

export const scrapingQueue: Queue = new Queue('scraping', { connection: redisConfig });
export const mentionQueue: Queue = new Queue('mention', { connection: redisConfig });
export const analysisQueue: Queue = new Queue('analysis', { connection: redisConfig });
export const notificationsQueue: Queue = new Queue('notifications', { connection: redisConfig });
export const reportsQueue: Queue = new Queue('reports', { connection: redisConfig });
export const cleanupQueue: Queue = new Queue('cleanup', { connection: redisConfig });

console.log(`📡 BullMQ Queues initialized with Redis: ${REDIS_URL}`);
