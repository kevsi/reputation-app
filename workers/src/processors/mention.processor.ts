/**
 * 📝 Mention Processor
 * 
 * Traite chaque mention collectée:
 * 1. Déduplication
 * 2. Analyse sentiment
 * 3. Extraction mots-clés
 * 4. Stockage en BD
 */

import { Job } from 'bullmq'
import { PrismaClient } from '@sentinelle/database'
import { aiService } from '../services/ai.service'
import { extractKeywords } from '../utils/keywords'
import { checkAlerts } from '../services/alert-checker.service'

const prisma = new PrismaClient();
import { SentimentType, Mention, SourceType } from '@sentinelle/database'
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export interface MentionJobData {
  content: string;
  author: string;
  authorUrl?: string;
  authorAvatar?: string;
  url: string;
  publishedAt: Date;
  externalId: string;
  platform: string;
  engagementCount?: number;
  brandId: string;
  sourceId: string;
  rawData?: Record<string, any>;
}

/**
 * Processeur principal pour les mentions
 */
export async function mentionProcessor(job: Job<MentionJobData>): Promise<Mention> {
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
    let sentiment: SentimentType = SentimentType.NEUTRAL
    let sentimentScore = 0

    try {
      const analysis = await aiService.analyzeSentiment(mention.content)
      sentiment = mapSentimentToEnum(analysis.sentiment)
      sentimentScore = analysis.score
      console.log(`🎯 Sentiment: ${sentiment} (score: ${sentimentScore})`)
    } catch (error) {
      console.warn(`⚠️ Sentiment analysis failed, using NEUTRAL:`, error)
      // Utiliser NEUTRAL comme défaut quand l'analyse échoue
      sentiment = SentimentType.NEUTRAL
      sentimentScore = 0
    }

    // 3️⃣ EXTRACTION MOTS-CLÉS
    let detectedKeywords: string[] = [];
    try {
      detectedKeywords = await extractKeywords(mention.content, mention.brandId);
      console.log(`🔑 Keywords found: ${detectedKeywords.join(', ')}`);
    } catch (error) {
      console.warn(`⚠️ Keyword extraction failed:`, error);
    }

    // 4️⃣ STOCKAGE EN BASE
    const savedMention = await prisma.mention.create({
      data: {
        brandId: mention.brandId,
        sourceId: mention.sourceId,
        content: mention.content,
        author: mention.author || 'Anonymous', // Garantir non-null
        url: mention.url,
        publishedAt: mention.publishedAt,
        sentiment,
        sentimentScore,
        language: 'fr', // À détecter automatiquement si besoin
        reachScore: mention.engagementCount || 0,
        engagementCount: mention.engagementCount || 0,
        rawData: mention.rawData,
        externalId: mention.externalId,
        platform: mention.platform as SourceType,
        detectedKeywords: detectedKeywords,
        isProcessed: true,
        analyzedAt: new Date(),
      },
    });

    // 5️⃣ VÉRIFICATION ALERTES
    try {
      await checkAlerts(savedMention.id, mention.brandId);
    } catch (error) {
      console.warn(`⚠️ Alert checking failed:`, error);
    }

    console.log(`✅ Mention ${mention.externalId} processed successfully`);
    return savedMention;

  } catch (error) {
    console.error(`❌ Error processing mention ${mention.externalId}:`, error);
    throw error;
  }
}

/**
 * Vérifie si la mention existe déjà (par externalId + platform)
 */
async function checkDuplicate(mention: MentionJobData): Promise<Mention | null> {
  return await prisma.mention.findFirst({
    where: {
      externalId: mention.externalId,
      platform: mention.platform as SourceType,
    },
  });
}

/**
 * Map le sentiment du AI service à l'enum de la BD
 */
function mapSentimentToEnum(
  sentiment: string
): SentimentType {
  const map: Record<string, SentimentType> = {
    POSITIVE: SentimentType.POSITIVE,
    NEGATIVE: SentimentType.NEGATIVE,
    NEUTRAL: SentimentType.NEUTRAL,
    MIXED: SentimentType.MIXED,
  };

  return map[sentiment.toUpperCase()] || SentimentType.NEUTRAL;
}
