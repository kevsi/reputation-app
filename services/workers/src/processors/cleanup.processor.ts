import { Job } from 'bull';
import axios from 'axios';
import { subDays } from 'date-fns';
import { logger } from '../utils/logger';

interface CleanupJobData {
  type: 'mentions' | 'alerts' | 'reports' | 'logs';
  retentionDays: number;
}

export const cleanupProcessor = async (job: Job<CleanupJobData>) => {
  const { type, retentionDays } = job.data;

  try {
    logger.info(`Starting cleanup for ${type} (retention: ${retentionDays} days)`);

    const cutoffDate = subDays(new Date(), retentionDays).toISOString();

    let deletedCount = 0;

    switch (type) {
      case 'mentions':
        deletedCount = await cleanupMentions(cutoffDate);
        break;

      case 'alerts':
        deletedCount = await cleanupAlerts(cutoffDate);
        break;

      case 'reports':
        deletedCount = await cleanupReports(cutoffDate);
        break;

      case 'logs':
        deletedCount = await cleanupLogs(cutoffDate);
        break;
    }

    logger.info(`Cleanup completed for ${type}`, {
      deletedCount,
      cutoffDate,
    });

    return { type, deletedCount, cutoffDate };

  } catch (error) {
    logger.error(`Cleanup failed for ${type}`, error);
    throw error;
  }
};

async function cleanupMentions(cutoffDate: string): Promise<number> {
  const response = await axios.delete(
    `${process.env.API_BASE_URL}/mentions/cleanup`,
    {
      params: { before: cutoffDate },
    }
  );
  return response.data.deletedCount;
}

async function cleanupAlerts(cutoffDate: string): Promise<number> {
  const response = await axios.delete(
    `${process.env.API_BASE_URL}/alerts/cleanup`,
    {
      params: { before: cutoffDate, status: 'resolved' },
    }
  );
  return response.data.deletedCount;
}

async function cleanupReports(cutoffDate: string): Promise<number> {
  // Supprimer les anciens rapports du stockage
  const response = await axios.delete(
    `${process.env.API_BASE_URL}/reports/cleanup`,
    {
      params: { before: cutoffDate },
    }
  );
  return response.data.deletedCount;
}

async function cleanupLogs(cutoffDate: string): Promise<number> {
  // Cleanup logs système
  return 0; // TODO: Implémenter
}