/**
 * Scheduler de scraping - Planification automatique
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import cron from 'node-cron';
import { SourcesRepository } from '@/modules/sources/sources.repository';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';
import { logger } from '@/infrastructure/logger';
import { prisma } from '@/shared/database/prisma.client';

export class ScrapingScheduler {
  private repository: SourcesRepository;
  private isRunning = false;

  constructor() {
    this.repository = new SourcesRepository();
  }

  /**
   * Démarrer le scheduler
   * Exécution toutes les 5 minutes
   */
  start() {
    logger.info('Starting scraping scheduler...');

    cron.schedule('*/5 * * * *', async () => {
      if (this.isRunning) {
        logger.warn('Previous scheduling job still running, skipping...');
        return;
      }

      await this.schedulePendingSources();
    });

    this.schedulePendingSources();
  }

  /**
   * Planifier les sources en attente de scraping
   */
  private async schedulePendingSources() {
    this.isRunning = true;

    try {
      const sources = await this.repository.findPendingSources();

      logger.info(`Found ${sources.length} sources to scrape`);

      for (const source of sources) {
        try {
          await scrapingQueue.add(
            'scrape-source',
            {
              sourceId: source.id,
              brandId: source.brandId,
              type: source.type,
              config: source.config,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
              removeOnComplete: {
                age: 3600,
                count: 100,
              },
              removeOnFail: {
                age: 86400,
              },
            }
          );

          await this.repository.updateScrapingStatus(source.id, {
            lastScrapedAt: new Date(),
          });

          logger.info(`Scheduled scraping for source ${source.id} (${source.type})`);
        } catch (error) {
          logger.error(`Failed to schedule source ${source.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Scheduling error:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

export function startScrapingScheduler() {
  const scheduler = new ScrapingScheduler();
  scheduler.start();
  logger.info('Scraping scheduler started');
}

/**
 * Scheduler de nettoyage des vieux jobs
 */
export function startCleanupScheduler() {
  logger.info('Starting cleanup scheduler (runs daily at 3:00 AM)');

  cron.schedule('0 3 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await prisma.scrapingJob.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
      });

      logger.info(`Deleted ${deleted.count} old scraping jobs`);
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  });
}

/**
 * Scheduler de statistiques
 */
export function startStatsScheduler() {
  logger.info('Starting stats scheduler (runs every hour)');

  cron.schedule('0 * * * *', async () => {
    try {
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);

      const [totalJobs, completedJobs, failedJobs, totalMentions] = await Promise.all([
        prisma.scrapingJob.count({ where: { createdAt: { gte: last24h } } }),
        prisma.scrapingJob.count({
          where: { createdAt: { gte: last24h }, status: 'COMPLETED' },
        }),
        prisma.scrapingJob.count({
          where: { createdAt: { gte: last24h }, status: 'FAILED' },
        }),
        prisma.scrapingJob.aggregate({
          where: { createdAt: { gte: last24h } },
          _sum: { mentionsCreated: true },
        }),
      ]);

      const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(2) : '0';

      logger.info('Scraping stats (last 24h)', {
        totalJobs,
        completedJobs,
        failedJobs,
        successRate: `${successRate}%`,
        totalMentionsCreated: totalMentions._sum.mentionsCreated || 0,
      });
    } catch (error) {
      logger.error('Stats error:', error);
    }
  });
}
