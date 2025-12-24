import { Job } from 'bull';
import axios from 'axios';
import { logger } from '../utils/logger';

interface AnalysisJobData {
  mentionId: string;
  text: string;
  organizationId: string;
}

interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  emotions: string[];
  viralityScore: number;
}

export const analysisProcessor = async (job: Job<AnalysisJobData>) => {
  const { mentionId, text, organizationId } = job.data;

  try {
    logger.info(`Processing analysis for mention ${mentionId}`);

    // Appel au service IA pour analyse
    const aiResponse = await axios.post<SentimentResult>(
      `${process.env.AI_SERVICE_URL}/analyze`,
      {
        text,
        options: {
          sentiment: true,
          emotions: true,
          virality: true,
        },
      },
      {
        timeout: 30000, // 30 secondes
      }
    );

    const analysis = aiResponse.data;

    // Mise à jour de la mention via l'API
    await axios.patch(
      `${process.env.API_BASE_URL}/mentions/${mentionId}`,
      {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.score,
        emotions: analysis.emotions,
        viralityScore: analysis.viralityScore,
        analyzedAt: new Date().toISOString(),
      }
    );

    // Si score viral élevé, créer une alerte
    if (analysis.viralityScore > 0.7 || analysis.sentiment === 'negative') {
      await axios.post(`${process.env.API_BASE_URL}/alerts`, {
        mentionId,
        organizationId,
        level: analysis.viralityScore > 0.8 ? 'critical' : 'medium',
        type: 'viral_risk',
        message: `High virality risk detected (score: ${analysis.viralityScore})`,
      });
    }

    logger.info(`Analysis completed for mention ${mentionId}`, {
      sentiment: analysis.sentiment,
      viralityScore: analysis.viralityScore,
    });

    return analysis;

  } catch (error) {
    logger.error(`Analysis failed for mention ${mentionId}`, error);
    throw error; // Bull retentera le job
  }
};