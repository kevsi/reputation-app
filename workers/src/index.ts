import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { scrapingProcessor } from './processors/scraping.processor'
import { mentionProcessor } from './processors/mention.processor'
import { scrapingScheduler } from './scheduler'

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

console.log('🚀 Démarrage des Workers...')
console.log('Redis connection:', { host: url.hostname, port: url.port })

// Worker pour le scraping
const scrapingWorker = new Worker('scraping', scrapingProcessor, {
  connection: redisConnection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 60000  // Max 10 jobs par minute
  }
})

// Worker pour le traitement des mentions
const mentionWorker = new Worker('mention', mentionProcessor, {
  connection: redisConnection,
  concurrency: 10
})

// Événements Scraping Worker
scrapingWorker.on('completed', (job) => {
  console.log(`✅ [SCRAPING] Job ${job.id} terminé`)
})

scrapingWorker.on('failed', (job, err) => {
  console.error(`❌ [SCRAPING] Job ${job?.id} échoué:`, err.message)
})

scrapingWorker.on('error', (err) => {
  console.error('❌ [SCRAPING] Erreur worker:', err)
})

// Événements Mention Worker
mentionWorker.on('completed', (job) => {
  console.log(`✅ [MENTION] Job ${job.id} terminé`)
})

mentionWorker.on('failed', (job, err) => {
  console.error(`❌ [MENTION] Job ${job?.id} échoué:`, err.message)
})

mentionWorker.on('error', (err) => {
  console.error('❌ [MENTION] Erreur worker:', err)
})

console.log('✅ Workers démarrés')
console.log('📡 Scraping Worker: 5 concurrent jobs')
console.log('📝 Mention Worker: 10 concurrent jobs')

// Démarrer le scheduler
scrapingScheduler.start().catch((error) => {
  console.error('❌ Erreur lors du démarrage du scheduler:', error)
})

// Graceful shutdown
const shutdown = async () => {
  console.log('⏳ Arrêt gracieux des workers...')

  await scrapingScheduler.stop()
  await scrapingWorker.close()
  await mentionWorker.close()
  await redisConnection.quit()

  console.log('✅ Workers arrêtés proprement')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
})