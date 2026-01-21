import { Job } from 'bull';
import { PrismaClient, SentimentType } from '@sentinelle/database';
import axios from 'axios';

const prisma = new PrismaClient();
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
            // AI service exposes: POST /analyze/sentiment
            // Response: { sentiment, confidence, scores: {positive, negative, neutral}, ... }
            const response = await axios.post(`${AI_SERVICE_URL}/analyze/sentiment`, { text: mention.content });

            const { sentiment, confidence, scores } = response.data ?? {};

            // 3. Update mention with sentiment
            // Map sentiment from AI service to our DB enum
            let dbSentiment: SentimentType;
            switch (String(sentiment || '').toUpperCase()) {
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

            // Convert AI scores to our DB sentimentScore (-1..1).
            // We use (positive - negative) which fits the desired range in most cases.
            const positive = typeof scores?.positive === 'number' ? scores.positive : 0;
            const negative = typeof scores?.negative === 'number' ? scores.negative : 0;
            const rawScore = positive - negative;
            const sentimentScore = Math.max(-1, Math.min(1, rawScore));

            await prisma.mention.update({
                where: { id: mentionId },
                data: {
                    sentiment: dbSentiment,
                    sentimentScore,
                    isProcessed: true,
                    analyzedAt: new Date()
                }
            });

            console.log(`✅ Mention ${mentionId} analyzed: ${dbSentiment} (score=${sentimentScore}, confidence=${confidence})`);

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
