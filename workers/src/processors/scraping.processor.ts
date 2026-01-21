import { Job } from 'bull';
import { PrismaClient, SentimentType, SourceType } from '@sentinelle/database';
import { analysisQueue } from '../lib/queues';
import { TrustpilotCollector } from '../collectors/trustpilot.collector';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const scrapingProcessor = async (job: Job) => {
    const { sourceId, url, brandId, type } = job.data;

    console.log(`🔍 Processing scrap job for Source: ${sourceId}, URL: ${url}, Type: ${type}`);

    if (!sourceId || !url) {
        console.warn('⚠️ Scrap job received with missing data:', job.data);
        return { success: false, error: 'Missing data' };
    }

    console.log(`🔍 Scraping source ${sourceId} (${type}) for brand ${brandId}: ${url}`);

    try {
        // 1. Mark source as active/scraped
        await prisma.source.update({
            where: { id: sourceId },
            data: {
                lastScrapedAt: new Date(),
                isActive: true
            }
        });

        // 2. Choose collector based on type
        let fetchedMentions: any[] = [];

        if (type === SourceType.TRUSTPILOT && url) {
            const collector = new TrustpilotCollector();
            fetchedMentions = await collector.collect(url);
        } else {
            // Fallback/Mock for other types for now
            console.log(`⚠️ No specific collector for ${type}, using mock data`);
            fetchedMentions = [
                {
                    content: `Mock mention for ${type} at ${new Date().toISOString()}`,
                    author: "System Mock",
                    publishedAt: new Date(),
                }
            ];
        }

        console.log(`📦 Found ${fetchedMentions.length} mentions`);

        // 3. Save mentions to DB and queue for analysis
        for (const mentionData of fetchedMentions) {
            // More robust de-duplication key (still schema-free):
            // hash(content + author + publishedAt + sourceId)
            const publishedAt = mentionData.publishedAt ? new Date(mentionData.publishedAt) : new Date();
            const dedupeKey = crypto
                .createHash('sha256')
                .update(`${sourceId}|${mentionData.author || ''}|${publishedAt.toISOString()}|${mentionData.content || ''}`)
                .digest('hex');

            // Check if mention already exists to avoid duplicates (simplified check)
            // We include publishedAt and store dedupeKey inside rawData for future checks.
            const existing = await prisma.mention.findFirst({
                where: {
                    sourceId,
                    author: mentionData.author,
                    publishedAt,
                    content: mentionData.content,
                }
            });

            if (existing) {
                console.log(`⏭️ Mention already exists, skipping: ${existing.id}`);
                continue;
            }

            const createdMention = await prisma.mention.create({
                data: {
                    content: mentionData.content,
                    author: mentionData.author,
                    publishedAt,
                    sourceId: sourceId,
                    brandId: brandId,
                    sentiment: SentimentType.NEUTRAL, // Default before AI analysis
                    isProcessed: false,
                    rawData: {
                        ...(mentionData.rawData || {}),
                        dedupeKey
                    }
                }
            });

            console.log(`📝 Mention created: ${createdMention.id}`);

            // 4. Queue for analysis
            await analysisQueue.add({
                mentionId: createdMention.id
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                }
            });
        }

        return { success: true, count: fetchedMentions.length };
    } catch (error) {
        console.error(`❌ Scraping failed for source ${sourceId}:`, error);

        // Update source with error
        await prisma.source.update({
            where: { id: sourceId },
            data: {
                errorCount: { increment: 1 },
                lastError: error instanceof Error ? error.message : String(error)
            }
        }).catch(console.error);

        throw error;
    }
};
