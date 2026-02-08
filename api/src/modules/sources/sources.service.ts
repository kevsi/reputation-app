/**
 * Service Sources - Logique métier
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { SourcesRepository } from './sources.repository';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';
import { AppError } from '@/shared/utils/errors';
import { logger } from '@/infrastructure/logger';
import { prisma } from '@/shared/database/prisma.client';
import type { CreateSourceDTO, UpdateSourceDTO } from './sources.types';

/** Convertit ScrapingFrequency (enum) en secondes */
function frequencyToSeconds(frequency: string): number {
  const map: Record<string, number> = {
    REALTIME: 300, // 5 minutes minimum
    EVERY_15_MIN: 15 * 60,
    HOURLY: 60 * 60,
    EVERY_6_HOURS: 6 * 60 * 60,
    DAILY: 24 * 60 * 60,
    WEEKLY: 7 * 24 * 60 * 60,
    MONTHLY: 30 * 24 * 60 * 60,
  };
  return map[frequency] ?? 86400;
}

export class SourcesService {
  private repository: SourcesRepository;

  constructor() {
    this.repository = new SourcesRepository();
  }

  /**
   * Récupérer toutes les sources d'une brand
   */
  async getByBrandId(brandId: string) {
    return this.repository.findByBrandId(brandId);
  }

  /**
   * Récupérer une source par ID
   */
  async getById(sourceId: string) {
    return this.repository.findById(sourceId);
  }

  /**
   * Créer une nouvelle source
   */
  async create(userId: string, brandId: string, data: CreateSourceDTO) {
    await this.checkPlanLimits(userId, brandId);
    this.validateSourceConfig(data.type, data.config);

    const scrapingFrequencySeconds = frequencyToSeconds(
      data.scrapingFrequency || 'DAILY'
    );

    const source = await this.repository.create({
      brand: { connect: { id: brandId } },
      type: data.type as any,
      name: data.name,
      config: data.config as any,
      isActive: true,
      scrapingFrequency: scrapingFrequencySeconds,
      lastScrapedAt: null,
      errorCount: 0,
    });

    logger.info(`Source created: ${source.id} (${source.type}) for brand ${brandId}`);

    await this.scheduleFirstScraping(source.id);

    return source;
  }

  /**
   * Mettre à jour une source
   */
  async update(sourceId: string, data: UpdateSourceDTO) {
    const source = await this.repository.findById(sourceId);

    if (!source) {
      throw new AppError('Source non trouvée', 404);
    }

    if (data.config) {
      this.validateSourceConfig(source.type, {
        ...(source.config as object),
        ...data.config,
      });
    }

    const updateData: Record<string, unknown> = { ...data };

    if (data.scrapingFrequency) {
      updateData.scrapingFrequency = frequencyToSeconds(data.scrapingFrequency);
    }

    return this.repository.update(sourceId, updateData as any);
  }

  /**
   * Supprimer une source (soft delete)
   */
  async delete(sourceId: string) {
    return this.repository.update(sourceId, {
      isActive: false,
    });
  }

  /**
   * Changer le statut d'une source
   */
  async updateStatus(sourceId: string, status: 'ACTIVE' | 'PAUSED') {
    const source = await this.repository.findById(sourceId);

    if (!source) {
      throw new AppError('Source non trouvée', 404);
    }

    return this.repository.update(sourceId, {
      isActive: status === 'ACTIVE',
    });
  }

  /**
   * Déclencher un scraping manuel immédiat
   */
  async triggerScraping(sourceId: string) {
    const source = await this.repository.findById(sourceId);

    if (!source) {
      throw new AppError('Source non trouvée', 404);
    }

    if (!source.isActive) {
      throw new AppError(
        'La source doit être active pour lancer un scraping',
        400
      );
    }

    const job = await scrapingQueue.add(
      'scrape-source',
      {
        sourceId: source.id,
        brandId: source.brandId,
        type: source.type,
        config: source.config,
        force: true,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    logger.info(`Manual scraping triggered for source ${sourceId}, job ${job.id}`);

    return { jobId: job.id };
  }

  /**
   * Vérifier les limites du plan utilisateur
   */
  private async checkPlanLimits(_userId: string, brandId: string) {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        organization: {
          include: { subscription: true },
        },
        sources: {
          where: { isActive: true },
        },
      },
    });

    if (!brand) {
      throw new AppError('Brand non trouvée', 404);
    }

    const plan = (brand.organization as any)?.subscription?.plan || 'FREE';
    const limits: Record<string, number> = {
      FREE: 3,
      STARTER: 10,
      PROFESSIONAL: 50,
      ENTERPRISE: Infinity,
      PRO: 50,
      PREMIUM: 100,
      TEAM: 999,
    };

    const currentCount = brand.sources.length;
    const limit = limits[plan] ?? limits.FREE;

    if (currentCount >= limit) {
      throw new AppError(
        `Limite de sources atteinte pour le plan ${plan}. Passez à un plan supérieur.`,
        403
      );
    }
  }

  /**
   * Valider la configuration selon le type de source
   */
  private validateSourceConfig(type: string, config: any) {
    switch (type) {
      case 'GOOGLE_REVIEWS':
        if (!config?.placeId || !config?.googleApiKey) {
          throw new AppError(
            'placeId et googleApiKey requis pour Google Reviews',
            400
          );
        }
        break;

      case 'TRUSTPILOT':
        if (!config?.companyUrl) {
          throw new AppError('companyUrl requis pour Trustpilot', 400);
        }
        break;

      case 'TWITTER':
        if (!config?.twitterBearerToken) {
          throw new AppError('twitterBearerToken requis pour Twitter', 400);
        }
        if (!config?.username && !config?.hashtags?.length) {
          throw new AppError('username ou hashtags requis pour Twitter', 400);
        }
        break;

      case 'NEWS':
        if (!config?.keywords?.length || !config?.newsApiKey) {
          throw new AppError('keywords et newsApiKey requis pour News', 400);
        }
        break;

      case 'RSS':
        if (!config?.feedUrl) {
          throw new AppError('feedUrl requis pour RSS', 400);
        }
        break;

      case 'REDDIT':
        if (
          !config?.subreddits?.length ||
          !config?.redditClientId ||
          !config?.redditClientSecret
        ) {
          throw new AppError(
            'subreddits, redditClientId et redditClientSecret requis pour Reddit',
            400
          );
        }
        break;

      case 'TRIPADVISOR':
        if (!config?.locationId) {
          throw new AppError('locationId requis pour TripAdvisor', 400);
        }
        break;

      case 'FACEBOOK':
        if (!config?.pageId || !config?.accessToken) {
          throw new AppError('pageId et accessToken requis pour Facebook', 400);
        }
        break;

      case 'INSTAGRAM':
        if (!config?.username || !config?.accessToken) {
          throw new AppError('username et accessToken requis pour Instagram', 400);
        }
        break;

      case 'YOUTUBE':
        if (!config?.youtubeApiKey) {
          throw new AppError('youtubeApiKey requis pour YouTube', 400);
        }
        if (!config?.channelId && !config?.videoId) {
          throw new AppError('channelId ou videoId requis pour YouTube', 400);
        }
        break;

      default:
        break;
    }
  }

  /**
   * Planifier le premier scraping (dans 1 minute)
   */
  private async scheduleFirstScraping(sourceId: string) {
    const source = await this.repository.findById(sourceId);

    if (!source) return;

    await scrapingQueue.add(
      'scrape-source',
      {
        sourceId: source.id,
        brandId: source.brandId,
        type: source.type,
        config: source.config,
      },
      {
        delay: 60000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    logger.info(`First scraping scheduled for source ${sourceId}`);
  }
}

export const sourcesService = new SourcesService();
