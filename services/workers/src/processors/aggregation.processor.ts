import { Job } from 'bull';
import axios from 'axios';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { logger } from '../utils/logger';

interface AggregationJobData {
  organizationId: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
}

export const aggregationProcessor = async (job: Job<AggregationJobData>) => {
  const { organizationId, date, type } = job.data;

  try {
    logger.info(`Aggregating ${type} stats for org ${organizationId}`);

    const targetDate = new Date(date);
    const startDate = startOfDay(targetDate);
    const endDate = endOfDay(targetDate);

    // Récupérer les mentions de la période
    const mentionsResponse = await axios.get(
      `${process.env.API_BASE_URL}/mentions`,
      {
        params: {
          organizationId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }
    );

    const mentions = mentionsResponse.data;

    // Calculer les statistiques
    const stats = {
      totalMentions: mentions.length,
      positiveMentions: mentions.filter((m: any) => m.sentiment === 'positive').length,
      neutralMentions: mentions.filter((m: any) => m.sentiment === 'neutral').length,
      negativeMentions: mentions.filter((m: any) => m.sentiment === 'negative').length,
      averageSentimentScore: calculateAverage(mentions.map((m: any) => m.sentimentScore)),
      averageViralityScore: calculateAverage(mentions.map((m: any) => m.viralityScore)),
      sourceBreakdown: groupBySource(mentions),
      topEmotions: getTopEmotions(mentions),
    };

    // Sauvegarder les stats agrégées
    await axios.post(`${process.env.API_BASE_URL}/trends`, {
      organizationId,
      date: targetDate.toISOString(),
      type,
      stats,
    });

    logger.info(`Aggregation completed for org ${organizationId}`, { stats });

    return stats;

  } catch (error) {
    logger.error(`Aggregation failed for org ${organizationId}`, error);
    throw error;
  }
};

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function groupBySource(mentions: any[]): Record<string, number> {
  return mentions.reduce((acc, mention) => {
    const source = mention.source;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
}

function getTopEmotions(mentions: any[], limit = 5): string[] {
  const emotionCounts: Record<string, number> = {};
  
  mentions.forEach((mention) => {
    mention.emotions?.forEach((emotion: string) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });

  return Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([emotion]) => emotion);
}