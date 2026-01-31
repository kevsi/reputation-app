"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleScrapingJobs = void 0;
const database_1 = require("@sentinelle/database");
const queues_1 = require("../lib/queues");
const prisma = new database_1.PrismaClient();
const scheduleScrapingJobs = async () => {
    console.log('⏰ Scheduling scraping jobs...');
    try {
        // 1. Fetch all active sources
        const activeSources = await prisma.source.findMany({
            where: { isActive: true },
            include: {
                brand: true
            }
        });
        // 2. Filter sources based on scraping frequency
        const now = Date.now();
        const dueSources = activeSources.filter((source) => {
            const frequencySeconds = source.scrapingFrequency ?? 3600;
            const last = source.lastScrapedAt ? new Date(source.lastScrapedAt).getTime() : 0;
            // If never scraped, always due. Otherwise due when elapsed >= frequency.
            return !source.lastScrapedAt || (now - last) >= frequencySeconds * 1000;
        });
        console.log(`📡 Found ${activeSources.length} active sources, ${dueSources.length} due to scrape`);
        for (const source of dueSources) {
            console.log(`📡 Attempting to queue scraping for: ${source.name} (ID: ${source.id})`);
            const job = await queues_1.scrapingQueue.add({
                sourceId: source.id,
                url: source.url,
                brandId: source.brandId,
                type: source.type
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 10000
                },
                removeOnComplete: true
            });
            console.log(`✅ Job added to queue with ID: ${job.id} for source: ${source.name}`);
        }
        return { success: true, count: dueSources.length };
    }
    catch (error) {
        console.error('❌ Failed to schedule scraping jobs:', error);
        throw error;
    }
};
exports.scheduleScrapingJobs = scheduleScrapingJobs;
