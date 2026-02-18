/**
 * Scraping Scheduler - Automated Source Scraping
 * 
 * Triggers scraping jobs for sources that need to be scraped based on:
 * - Last scraped timestamp
 * - Scraping frequency
 * - Active status
 * 
 * Uses BullMQ's delayed jobs for scheduling.
 */

import { prisma } from '@/shared/database/prisma.client';
import { logger } from '@/infrastructure/logger';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';
import { alertingService, AlertSeverity, AlertSource } from '@/infrastructure/monitoring/alerting.service';

interface Source {
  id: string;
  brandId: string;
  type: string;
  scrapingFrequency: number;
  lastScrapedAt: Date | null;
  errorCount: number;
}

/**
 * Find sources that need to be scraped
 */
async function findPendingSources(): Promise<Source[]> {
  const now = new Date();

  const sources = await prisma.source.findMany({
    where: {
      isActive: true,
    },
  });

  const pendingSources = sources.filter((source: any) => {
    // If never scraped, include it
    if (!source.lastScrapedAt) return true;
    
    // Check if enough time has passed based on frequency
    const lastScraped = source.lastScrapedAt.getTime();
    const frequencyMs = (source.scrapingFrequency || 21600) * 1000;
    const nextScrape = lastScraped + frequencyMs;
    
    return now.getTime() >= nextScrape;
  });

  return pendingSources.map((source: any) => ({
    id: source.id,
    brandId: source.brandId,
    type: source.type,
    scrapingFrequency: source.scrapingFrequency || 21600,
    lastScrapedAt: source.lastScrapedAt,
    errorCount: source.errorCount || 0
  }));
}

/**
 * Add a scraping job to the queue
 */
async function scheduleScrapingJob(
  sourceId: string,
  brandId: string,
  type: string,
  delayMs: number = 0
): Promise<void> {
  try {
    await scrapingQueue.add(
      'scraping',
      { sourceId, brandId, type },
      {
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential' as const,
          delay: 2000
        },
        removeOnComplete: {
          age: 3600,
          count: 100
        },
        removeOnFail: {
          age: 86400,
          count: 1000
        }
      }
    );
    
    logger.info(`Scheduled scraping job for source ${sourceId} (delay: ${delayMs}ms)`);
  } catch (error) {
    logger.error(`Failed to schedule scraping job for source ${sourceId}`, error as Error);
    throw error;
  }
}

/**
 * Main scheduler function - call this periodically (e.g., every 5 minutes)
 */
export async function runScrapingScheduler(): Promise<{
  scheduled: number;
  skipped: number;
  errors: number;
}> {
  const results = {
    scheduled: 0,
    skipped: 0,
    errors: 0
  };
  
  try {
    logger.info('Running scraping scheduler...');
    
    const pendingSources = await findPendingSources();
    
    if (pendingSources.length === 0) {
      logger.debug('No pending sources to scrape');
      return results;
    }
    
    logger.info(`Found ${pendingSources.length} sources pending scraping`);
    
    for (const source of pendingSources) {
      try {
        // Skip sources with too many errors (circuit breaker concept at source level)
        if (source.errorCount >= 5) {
          logger.warn(`Source ${source.id} has ${source.errorCount} errors, skipping`);
          await alertingService.alertJobFailureThreshold(
            source.id,
            source.brandId,
            source.errorCount
          );
          results.skipped++;
          continue;
        }
        
        // Add small random delay to avoid thundering herd
        const randomDelay = Math.floor(Math.random() * 30000); // 0-30 seconds
        
        await scheduleScrapingJob(source.id, source.brandId, source.type, randomDelay);
        results.scheduled++;
      } catch (error) {
        logger.error(`Failed to schedule source ${source.id}`, error as Error);
        results.errors++;
      }
    }
    
    logger.info(`Scheduler completed: ${results.scheduled} scheduled, ${results.skipped} skipped, ${results.errors} errors`);
    
    return results;
  } catch (error) {
    logger.error('Scraping scheduler failed', error as Error);
    await alertingService.alert(
      'scheduler_error',
      AlertSeverity.ERROR,
      AlertSource.QUEUE,
      'Scheduler Failed',
      `Scraping scheduler error: ${(error as Error).message}`,
      { error: (error as Error).message }
    );
    throw error;
  }
}

/**
 * Start the scheduler as a background job
 */
export function startScheduler(intervalMs: number = 300000): NodeJS.Timeout {
  logger.info(`Starting scraping scheduler with interval: ${intervalMs}ms`);
  
  // Run immediately on start
  runScrapingScheduler().catch(err => {
    logger.error('Initial scheduler run failed', err);
  });
  
  // Then run periodically
  const interval = setInterval(() => {
    runScrapingScheduler().catch(err => {
      logger.error('Scheduled run failed', err);
    });
  }, intervalMs);
  
  return interval;
}

/**
 * Stop the scheduler
 */
export function stopScheduler(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  logger.info('Scraping scheduler stopped');
}

// Export for manual triggering
export { findPendingSources, scheduleScrapingJob };
