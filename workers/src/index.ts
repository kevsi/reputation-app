import * as dotenv from 'dotenv';
dotenv.config();
import Redis from 'ioredis';
import { scrapingProcessor } from './processors/scraping.processor';
import { analysisProcessor } from './processors/analysis.processor';
import { notificationsProcessor } from './processors/notifications.processor';
import { reportsProcessor } from './processors/reports.processor';
import { scrapingQueue, analysisQueue, notificationsQueue, reportsQueue } from './lib/queues';
import { scheduleScrapingJobs } from './jobs/scheduled-scraping.job';
import { setupMonitor } from './lib/monitor';

import { PrismaClient } from '@sentinelle/database';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);
const prisma = new PrismaClient();

console.log('🔧 Sentinelle Workers starting...');
console.log(`📡 Redis URL: ${REDIS_URL}`);
console.log(`📡 Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'MISSING'}`);

const checkConnections = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    const sourceCount = await prisma.source.count();
    console.log(`📊 Current sources in DB: ${sourceCount}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
};

checkConnections();

// Start monitoring UI
setupMonitor();

// Register processors
// Note: We use named processors or a default one
scrapingQueue.process('*', (job) => {
  if (job.name === 'scheduled-scraping') {
    return scheduleScrapingJobs();
  }
  return scrapingProcessor(job);
});

analysisQueue.process(analysisProcessor);
notificationsQueue.process(notificationsProcessor);
reportsQueue.process(reportsProcessor);

console.log('✅ Processors registered: scraping, analysis, notifications, reports');

// Initialize scheduler
const startScheduler = async () => {
  console.log('📅 Initializing scheduler...');

  // Clean existing repeatable jobs to avoid duplicates
  const repeatableJobs = await scrapingQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === 'scheduled-scraping') {
      await scrapingQueue.removeRepeatableByKey(job.key);
    }
  }

  // Schedule scraping every hour
  await scrapingQueue.add('scheduled-scraping', {}, {
    repeat: { cron: '0 * * * *' },
    removeOnComplete: true
  });

  // For dev/testing purposes, trigger an immediate run if requested or in dev
  if (process.env.TRIGGER_INITIAL_SCRAPE === 'true') {
    console.log('🚀 Triggering initial scraping run...');
    await scheduleScrapingJobs();
  }
};

startScheduler().catch(err => {
  console.error('❌ Failed to start scheduler:', err);
});

// Health check
const healthCheck = setInterval(() => {
  console.log('⚡ Workers alive:', new Date().toISOString());
}, 60000);

// Graceful shutdown
const shutdown = async () => {
  console.log('👋 Workers shutting down...');
  clearInterval(healthCheck);

  await scrapingQueue.close();
  await analysisQueue.close();
  await notificationsQueue.close();
  await reportsQueue.close();
  await redis.quit();

  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});