"use strict";
/**
 * 🕵️ Scraping Processor
 *
 * Orchestration de la collecte:
 * 1. Récupère les keywords de la marque
 * 2. Lance le collector approprié
 * 3. Enqueue chaque mention pour traitement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapingProcessor = scrapingProcessor;
const database_1 = require("../config/database");
const collectors_1 = require("../collectors");
const queues_1 = require("../config/queues");
/**
 * Processeur principal pour les jobs de scraping
 */
async function scrapingProcessor(job) {
    const { sourceId, force } = job.data;
    console.log(`🕵️ Scraping source: ${sourceId}`);
    try {
        // 1️⃣ CHARGER LA SOURCE
        const source = await database_1.prisma.source.findUnique({
            where: { id: sourceId },
            include: {
                brand: {
                    select: {
                        id: true,
                        name: true,
                        keywords: true
                    }
                }
            },
        });
        if (!source) {
            console.error(`❌ Source ${sourceId} not found`);
            throw new Error(`Source ${sourceId} not found`);
        }
        // 2️⃣ VÉRIFIER QUE LA SOURCE EST ACTIVE
        if (!source.isActive && !force) {
            console.log(`⏭️ Source ${sourceId} is inactive, skipping`);
            return { skipped: true };
        }
        // 3️⃣ VÉRIFIER QUE LA MARQUE A DES MOTS-CLÉS
        let keywords = source.brand.keywords;
        if (keywords.length === 0) {
            console.warn(`⚠️ Brand ${source.brandId} has no keywords, using brand name as default`);
            keywords = [source.brand.name];
        }
        console.log(`🔑 Keywords to search: ${keywords.join(', ')}`);
        // 4️⃣ OBTENIR LE COLLECTOR
        const collector = collectors_1.CollectorFactory.getCollector(source.type);
        console.log(`🏭 Using ${source.type} collector`);
        // 5️⃣ COLLECTER LES MENTIONS
        let mentions = [];
        try {
            const rawMentions = await collector.collect(source, keywords);
            mentions = rawMentions.map((raw) => ({
                text: raw.text,
                author: raw.author,
                authorUrl: raw.authorUrl,
                authorAvatar: raw.authorAvatar,
                url: raw.url,
                publishedAt: raw.publishedAt,
                externalId: raw.externalId,
                platform: raw.platform,
                engagementCount: raw.engagementCount,
                rawData: raw.rawData,
                brandId: source.brandId,
                sourceId: source.id,
            }));
            console.log(`📊 Collected ${mentions.length} mentions`);
        }
        catch (error) {
            console.error(`❌ Collection failed for ${source.type}:`, error);
            throw error;
        }
        // 6️⃣ ENQUEUE LES MENTIONS POUR TRAITEMENT
        let enqueuedCount = 0;
        for (const mention of mentions) {
            try {
                await queues_1.mentionQueue.add('process-mention', mention, {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                });
                enqueuedCount++;
            }
            catch (error) {
                console.error(`⚠️ Failed to enqueue mention ${mention.externalId}:`, error);
            }
        }
        console.log(`✅ Enqueued ${enqueuedCount} mentions for processing`);
        // 7️⃣ METTRE À JOUR LA SOURCE
        await database_1.prisma.source.update({
            where: { id: sourceId },
            data: {
                lastScrapedAt: new Date(),
                errorCount: 0,
            },
        });
        return {
            success: true,
            sourceId,
            collectedMentions: mentions.length,
            enqueuedMentions: enqueuedCount,
        };
    }
    catch (error) {
        console.error(`❌ Scraping failed for source ${sourceId}:`, error);
        // Incrémenter le compteur d'erreurs
        try {
            await database_1.prisma.source.update({
                where: { id: sourceId },
                data: {
                    errorCount: {
                        increment: 1,
                    },
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
        catch (dbError) {
            console.error('Failed to update source error count:', dbError);
        }
        throw error;
    }
}
