/**
 * Processor de scraping - Traitement des jobs BullMQ
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 * Appelle le scraper Python via HTTP ou exécute Scrapy en local
 */
import { Job } from 'bullmq';
import axios from 'axios';
import { SourcesRepository } from '@/modules/sources/sources.repository';
import { mentionsService } from '@/modules/mentions/mentions.service';
import { logger } from '@/infrastructure/logger';
import { AppError } from '@/shared/utils/errors';

interface ScrapingJobData {
  sourceId: string;
  brandId: string;
  type: string;
  config: any;
  force?: boolean;
}

interface ScrapedItem {
  externalId: string;
  content: string;
  author?: string;
  authorAvatar?: string;
  publishedAt: string;
  url?: string;
  metadata?: Record<string, any>;
}

const sourcesRepository = new SourcesRepository();

/** Convertit fréquence (secondes) en intervalle pour nextScraping */
function calculateNextScrapingTime(frequencySeconds: number): Date {
  const now = new Date();
  return new Date(now.getTime() + frequencySeconds * 1000);
}

/**
 * Traiter un job de scraping
 */
export async function processScrapingJob(job: Job<ScrapingJobData>) {
  const { sourceId, brandId, type, config, force } = job.data;

  logger.info(`Starting scraping for source ${sourceId} (${type})`);

  const source = await sourcesRepository.findById(sourceId);
  if (!source) {
    throw new AppError('Source non trouvée', 404);
  }
  if (!source.isActive && !force) {
    logger.warn(`Source ${sourceId} inactive, skipping`);
    return { success: true, mentionsCreated: 0, skipped: true };
  }

  const frequencySeconds = source.scrapingFrequency || 86400;

  try {
    let scrapedData: ScrapedItem[] = [];

    // Tenter d'appeler le scraper API Python si disponible
    const scraperUrl = process.env.SCRAPER_SERVICE_URL || process.env.SCRAPER_API_URL;
    if (scraperUrl) {
      scrapedData = await callScraperApi(type, config, job);
    }

    // Fallback: exécuter Scrapy en local
    if (!scrapedData || scrapedData.length === 0) {
      scrapedData = await runScrapyLocally(sourceId, type, config, source, job);
    }

    if (!scrapedData || scrapedData.length === 0) {
      logger.warn(`No data scraped for source ${sourceId}`);
      await sourcesRepository.updateScrapingStatus(sourceId, {
        lastScrapedAt: new Date(),
        lastScrapingError: null,
        errorCount: 0,
      });
      return { success: true, mentionsCreated: 0 };
    }

    const createdMentions = await createMentionsFromScrapedData(
      sourceId,
      brandId,
      scrapedData,
      job
    );

    await sourcesRepository.updateScrapingStatus(sourceId, {
      lastScrapedAt: new Date(),
      lastScrapingError: null,
      errorCount: 0,
    });

    logger.info(
      `Scraping completed for source ${sourceId}: ${createdMentions.length} mentions created`
    );

    return {
      success: true,
      mentionsCreated: createdMentions.length,
      duplicates: scrapedData.length - createdMentions.length,
    };
  } catch (error: any) {
    logger.error(`Scraping failed for source ${sourceId}:`, error);

    await sourcesRepository.updateScrapingStatus(sourceId, {
      lastScrapedAt: new Date(),
      lastScrapingError: error.message || 'Unknown error',
      errorCount: (source.errorCount || 0) + 1,
    });

    throw error;
  }
}

/**
 * Appeler le scraper Python via HTTP
 */
async function callScraperApi(
  type: string,
  config: any,
  job: Job
): Promise<ScrapedItem[]> {
  const scraperUrl = process.env.SCRAPER_SERVICE_URL || process.env.SCRAPER_API_URL || 'http://localhost:8001';
  const endpoint = getScraperEndpoint(type);

  try {
    const response = await axios.post(
      `${scraperUrl}${endpoint}`,
      config,
      {
        timeout: 300000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    await job.updateProgress({
      phase: 'scraping_complete',
      itemsFound: response.data?.data?.length || 0,
    });

    return response.data?.data || [];
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new AppError('Rate limit atteint pour cette source', 429);
    }
    throw new AppError(
      `Erreur scraper: ${error.message}`,
      error.response?.status || 500
    );
  }
}

function getScraperEndpoint(type: string): string {
  const endpoints: Record<string, string> = {
    GOOGLE_REVIEWS: '/scrape/google-reviews',
    TRUSTPILOT: '/scrape/trustpilot',
    TRIPADVISOR: '/scrape/tripadvisor',
    TWITTER: '/scrape/twitter',
    REDDIT: '/scrape/reddit',
    NEWS: '/scrape/news',
    RSS: '/scrape/rss',
    YOUTUBE: '/scrape/youtube',
  };
  return endpoints[type] || '/scrape/generic';
}

/**
 * Exécuter Scrapy en local (fallback)
 * Les mentions sont créées par le pipeline Scrapy si configuré
 */
async function runScrapyLocally(
  sourceId: string,
  type: string,
  config: any,
  source: any,
  job: Job
): Promise<ScrapedItem[]> {
  const { spawn } = await import('child_process');
  const path = await import('path');

  const spiderName = getSpiderName(type);
  const scrapersPath = path.resolve(process.cwd(), '../../scrapers');

  await job.updateProgress({ phase: 'running_scrapy', spider: spiderName });

  return new Promise((resolve, reject) => {
    const args = ['crawl', spiderName, '-a', `source_id=${sourceId}`];
    if (config?.companyUrl) args.push('-a', `company_url=${config.companyUrl}`);
    if (config?.companyName) args.push('-a', `company_name=${config.companyName}`);

    const child = spawn('scrapy', args, {
      cwd: scrapersPath,
      shell: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve([]);
      } else {
        reject(new Error(`Scrapy exit code: ${code}`));
      }
    });

    child.on('error', reject);
  });
}

function getSpiderName(sourceType: string): string {
  const spiderMap: Record<string, string> = {
    TRUSTPILOT: 'trustpilot',
    GOOGLE_REVIEWS: 'google_reviews',
    NEWS: 'news',
  };
  return spiderMap[sourceType] || 'news';
}

/**
 * Créer les mentions à partir des données scrapées
 */
async function createMentionsFromScrapedData(
  sourceId: string,
  brandId: string,
  scrapedData: ScrapedItem[],
  job: Job
): Promise<any[]> {
  const createdMentions: any[] = [];

  for (let i = 0; i < scrapedData.length; i++) {
    const item = scrapedData[i];

    try {
      await job.updateProgress({
        phase: 'creating_mentions',
        current: i + 1,
        total: scrapedData.length,
      });

      const mention = await mentionsService.createFromScraper({
        sourceId,
        brandId,
        externalId: item.externalId,
        content: item.content,
        author: item.author,
        authorAvatar: item.authorAvatar,
        publishedAt: new Date(item.publishedAt),
        url: item.url,
        metadata: item.metadata || {},
      });

      createdMentions.push(mention);
    } catch (error: any) {
      if (error.code === 'P2002') {
        logger.debug(`Duplicate mention skipped: ${item.externalId}`);
        continue;
      }
      logger.error(`Failed to create mention ${item.externalId}:`, error);
    }
  }

  return createdMentions;
}
