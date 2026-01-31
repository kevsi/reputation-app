"use strict";
/**
 * 📝 Mention Processor
 *
 * Traite chaque mention collectée:
 * 1. Déduplication
 * 2. Analyse sentiment
 * 3. Extraction mots-clés
 * 4. Stockage en BD
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentionProcessor = mentionProcessor;
const database_1 = require("../config/database");
const ai_service_1 = require("../services/ai.service");
const keywords_1 = require("../utils/keywords");
const alert_checker_service_1 = require("../services/alert-checker.service");
const database_2 = require("@sentinelle/database");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
/**
 * Processeur principal pour les mentions
 */
async function mentionProcessor(job) {
    const mention = job.data;
    console.log(`📝 Processing mention: ${mention.externalId} from ${mention.platform}`);
    try {
        // 1️⃣ DÉDUPLICATION
        const existingMention = await checkDuplicate(mention);
        if (existingMention) {
            console.log(`⚠️ Mention ${mention.externalId} already exists, skipping`);
            return existingMention;
        }
        // 2️⃣ ANALYSE SENTIMENT
        let sentiment = database_2.SentimentType.NEUTRAL;
        let sentimentScore = 0;
        try {
            const analysis = await ai_service_1.aiService.analyzeSentiment(mention.text);
            sentiment = mapSentimentToEnum(analysis.sentiment);
            sentimentScore = analysis.score;
            console.log(`🎯 Sentiment: ${sentiment} (score: ${sentimentScore})`);
        }
        catch (error) {
            console.warn(`⚠️ Sentiment analysis failed, using NEUTRAL:`, error);
        }
        // 3️⃣ EXTRACTION MOTS-CLÉS
        let detectedKeywords = [];
        try {
            detectedKeywords = await (0, keywords_1.extractKeywords)(mention.text, mention.brandId);
            console.log(`🔑 Keywords found: ${detectedKeywords.join(', ')}`);
        }
        catch (error) {
            console.warn(`⚠️ Keyword extraction failed:`, error);
        }
        // 4️⃣ STOCKAGE EN BASE
        const savedMention = await database_1.prisma.mention.create({
            data: {
                brandId: mention.brandId,
                sourceId: mention.sourceId,
                text: mention.text,
                author: mention.author,
                url: mention.url,
                publishedAt: mention.publishedAt,
                sentiment,
                sentimentScore,
                language: 'fr', // À détecter automatiquement si besoin
                reachScore: mention.engagementCount || 0,
                engagementCount: mention.engagementCount || 0,
                rawData: mention.rawData,
                externalId: mention.externalId,
                platform: mention.platform,
                detectedKeywords: detectedKeywords,
                isProcessed: true,
                analyzedAt: new Date(),
            },
        });
        // 5️⃣ VÉRIFICATION ALERTES
        try {
            await (0, alert_checker_service_1.checkAlerts)(savedMention.id, mention.brandId);
        }
        catch (error) {
            console.warn(`⚠️ Alert checking failed:`, error);
        }
        console.log(`✅ Mention ${mention.externalId} processed successfully`);
        return savedMention;
    }
    catch (error) {
        console.error(`❌ Error processing mention ${mention.externalId}:`, error);
        throw error;
    }
}
/**
 * Vérifie si la mention existe déjà (par externalId + platform)
 */
async function checkDuplicate(mention) {
    return await database_1.prisma.mention.findFirst({
        where: {
            externalId: mention.externalId,
            platform: mention.platform,
        },
    });
}
/**
 * Map le sentiment du AI service à l'enum de la BD
 */
function mapSentimentToEnum(sentiment) {
    const map = {
        POSITIVE: database_2.SentimentType.POSITIVE,
        NEGATIVE: database_2.SentimentType.NEGATIVE,
        NEUTRAL: database_2.SentimentType.NEUTRAL,
        MIXED: database_2.SentimentType.MIXED,
    };
    return map[sentiment.toUpperCase()] || database_2.SentimentType.NEUTRAL;
}
