"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const scraping_processor_1 = require("./processors/scraping.processor");
const mention_processor_1 = require("./processors/mention.processor");
const redisConnection = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
});
console.log('🚀 Démarrage des Workers...');
// Worker pour le scraping
const scrapingWorker = new bullmq_1.Worker('scraping', scraping_processor_1.scrapingProcessor, {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 60000 // Max 10 jobs par minute
    }
});
// Worker pour le traitement des mentions
const mentionWorker = new bullmq_1.Worker('mentions', mention_processor_1.mentionProcessor, {
    connection: redisConnection,
    concurrency: 10
});
// Événements Scraping Worker
scrapingWorker.on('completed', (job) => {
    console.log(`✅ [SCRAPING] Job ${job.id} terminé`);
});
scrapingWorker.on('failed', (job, err) => {
    console.error(`❌ [SCRAPING] Job ${job?.id} échoué:`, err.message);
});
scrapingWorker.on('error', (err) => {
    console.error('❌ [SCRAPING] Erreur worker:', err);
});
// Événements Mention Worker
mentionWorker.on('completed', (job) => {
    console.log(`✅ [MENTION] Job ${job.id} terminé`);
});
mentionWorker.on('failed', (job, err) => {
    console.error(`❌ [MENTION] Job ${job?.id} échoué:`, err.message);
});
mentionWorker.on('error', (err) => {
    console.error('❌ [MENTION] Erreur worker:', err);
});
console.log('✅ Workers démarrés');
console.log('📡 Scraping Worker: 5 concurrent jobs');
console.log('📝 Mention Worker: 10 concurrent jobs');
// Graceful shutdown
const shutdown = async () => {
    console.log('⏳ Arrêt gracieux des workers...');
    await scrapingWorker.close();
    await mentionWorker.close();
    await redisConnection.quit();
    console.log('✅ Workers arrêtés proprement');
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
