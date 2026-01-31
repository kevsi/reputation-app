"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisProcessor = void 0;
const database_1 = require("../config/database");
const ai_service_1 = require("../services/ai.service");
const database_2 = require("@sentinelle/database");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const analysisProcessor = async (job) => {
    const { mentionId } = job.data;
    console.log(`🤖 Analyzing mention ${mentionId}...`);
    try {
        // 1. Fetch mention
        const mention = await database_1.prisma.mention.findUnique({
            where: { id: mentionId }
        });
        if (!mention) {
            console.warn(`⚠️ Mention ${mentionId} not found`);
            return;
        }
        // 2. Call AI Service for sentiment analysis
        try {
            const analysis = await ai_service_1.aiService.analyzeSentiment(mention.text);
            // 3. Update mention with sentiment
            let dbSentiment;
            switch (analysis.sentiment.toUpperCase()) {
                case 'POSITIVE':
                    dbSentiment = database_2.SentimentType.POSITIVE;
                    break;
                case 'NEGATIVE':
                    dbSentiment = database_2.SentimentType.NEGATIVE;
                    break;
                case 'MIXED':
                    dbSentiment = database_2.SentimentType.MIXED;
                    break;
                default:
                    dbSentiment = database_2.SentimentType.NEUTRAL;
            }
            await database_1.prisma.mention.update({
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
        }
        catch (aiError) {
            console.error(`❌ AI Service error for mention ${mentionId}:`, aiError);
            throw aiError;
        }
    }
    catch (error) {
        console.error(`❌ Analysis failed for mention ${mentionId}:`, error);
        throw error;
    }
};
exports.analysisProcessor = analysisProcessor;
