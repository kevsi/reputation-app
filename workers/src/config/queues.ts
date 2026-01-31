import { Queue } from 'bullmq'
import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL
const url = new URL(REDIS_URL);

// Configuration Redis pour Docker
const redisConfig = {
  host: url.hostname, // Utilise directement le hostname (redis, localhost, etc.)
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
  enableReadyCheck: false,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: null  // BullMQ nécessite null
}

const redisConnection = new Redis(redisConfig)

export const scrapingQueue = new Queue('scraping', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

export const analysisQueue = new Queue('analysis', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

export const notificationsQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

export const reportsQueue = new Queue('reports', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})