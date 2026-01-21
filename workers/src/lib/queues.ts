import 'dotenv/config';
import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const scrapingQueue = new Queue('scraping', REDIS_URL);
export const analysisQueue = new Queue('analysis', REDIS_URL);
export const notificationsQueue = new Queue('notifications', REDIS_URL);
export const reportsQueue = new Queue('reports', REDIS_URL);
export const cleanupQueue = new Queue('cleanup', REDIS_URL);

console.log(`📡 Bull Queues initialized with Redis: ${REDIS_URL}`);
