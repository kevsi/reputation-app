import { Job } from 'bullmq';
import { prisma } from '../config/database';
import { aiService } from '../services/ai.service';
import { SentimentType } from '@sentinelle/database';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const analysisProcessor = async (job: Job) => {
    const { mentionId } = job.data;

    console.log(`🤖 Analyzing mention ${mentionId}...`);

    try {
        // 1. Fetch mention
        const mention = await prisma.mention.findUnique({
            where: { id: mentionId }
        });

        if (!mention) {
            console.warn(`⚠️ Mention ${mentionId} not found`);
            return;
        }

        // 2. Call AI Service for sentiment analysis
        try {
            const analysis = await aiService.analyzeSentiment(mention.content);

            // 3. Update mention with sentiment
            let dbSentiment: SentimentType;
            switch (analysis.sentiment.toUpperCase()) {
                case 'POSITIVE':
                    dbSentiment = SentimentType.POSITIVE;
                    break;
                case 'NEGATIVE':
                    dbSentiment = SentimentType.NEGATIVE;
                    break;
                case 'MIXED':
                    dbSentiment = SentimentType.MIXED;
                    break;
                default:
                    dbSentiment = SentimentType.NEUTRAL;
            }

            await prisma.mention.update({
                where: { id: mentionId },
                data: {
                    sentiment: dbSentiment,
                    sentimentScore: analysis.score,
                    isProcessed: true,
                    analyzedAt: new Date()
                }
            });

            console.log(`✅ Mention ${mentionId} analyzed: ${dbSentiment} (score=${analysis.score}, confidence=${analysis.confidence})`);

            return { success: true, sentiment: dbSentiment };
        } catch (aiError) {
            console.error(`❌ AI Service error for mention ${mentionId}:`, aiError);
            throw aiError;
        }
    } catch (error) {
        console.error(`❌ Analysis failed for mention ${mentionId}:`, error);
        throw error;
    }
};
