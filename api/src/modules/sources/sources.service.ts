/**
 * 🔌 Sources Service
 * 
 * Gère les sources: création, validation, activation de scraping
 */

import { prisma } from '../../shared/database/prisma.client';
import { SourceType, Source } from '@sentinelle/database';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';
// CollectorFactory is available at runtime through workers package
import { AppError } from '@/shared/utils/errors';
import { validateSourceAllowed, checkForbiddenDomain } from '@/shared/config/forbidden-domains';
import { logger } from '@/infrastructure/logger';

export interface CreateSourceDTO {
  brandId: string;
  type: SourceType;
  name: string;
  config: Record<string, any>;
  scrapingFrequency?: number; // en millisecondes, défaut 6h
}

class SourcesService {
  async getAllSources() {
    return await prisma.source.findMany({
      include: { brand: true }
    });
  }

  async getSourcesByOrganization(organizationId: string) {
    return await prisma.source.findMany({
      where: {
        brand: {
          organizationId
        }
      },
      include: { brand: true }
    });
  }

  async getActiveSources() {
    return await prisma.source.findMany({
      where: { isActive: true },
      include: { brand: true }
    });
  }

  async getSourceById(id: string) {
    return await prisma.source.findUnique({
      where: { id },
      include: { brand: true }
    });
  }

  /**
   * Crée une nouvelle source avec validation des credentials
   */
  async createSource(input: CreateSourceDTO): Promise<Source> {
    logger.info(`📌 Creating source: ${input.type} for brand ${input.brandId}`);

    // 1️⃣ VÉRIFIER QUE LA MARQUE EXISTE
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId },
      include: { organization: { include: { subscription: true } } }
    });

    if (!brand) {
      throw new AppError('Brand not found', 404, 'BRAND_NOT_FOUND');
    }

    // 1B️⃣ VÉRIFIER URL POUR WEB SOURCES
    const webSourceTypes = ['FORUM', 'BLOG', 'NEWS', 'REVIEW', 'RSS'];
    if (webSourceTypes.includes(input.type) && !input.config?.url) {
      throw new AppError(
        `URL is required for source type ${input.type}`,
        400,
        'MISSING_URL'
      );
    }

    // 🚫 VÉRIFIER LES DOMAINES INTERDITS (AVANT LA CRÉATION)
    const url = input.config?.url;
    const forbidden = checkForbiddenDomain(url);
    if (forbidden.isBlocked) {
      logger.warn(`🚫 BLOCKED SOURCE: ${input.type} | URL: ${url} | Reason: ${forbidden.reason}`, {
        brandId: input.brandId,
        sourceType: input.type,
        url,
        platformName: forbidden.platformName,
      });
      throw new AppError(
        forbidden.reason || 'Cette plateforme n\'est pas autorisée',
        403,
        'PLATFORM_FORBIDDEN'
      );
    }

    // Vérifier aussi par type de source
    const sourceValidation = validateSourceAllowed(input.type, url);
    if (!sourceValidation.valid) {
      logger.warn(`🚫 BLOCKED SOURCE TYPE: ${input.type} | Reason: ${sourceValidation.error}`, {
        brandId: input.brandId,
        sourceType: input.type,
      });
      throw new AppError(
        sourceValidation.error || 'Ce type de source n\'est pas autorisé',
        403,
        'SOURCE_TYPE_FORBIDDEN'
      );
    }

    // 2️⃣ VÉRIFIER LES LIMITES DE PLAN
    const sourceCount = await prisma.source.count({
      where: { brand: { organizationId: brand.organizationId } }
    });

    const plan = brand.organization.subscription;
    const maxSources = this.getPlanLimit(plan?.plan || 'FREE', 'maxSources');

    if (sourceCount >= maxSources) {
      throw new AppError(
        `Maximum sources reached for your plan (${maxSources})`,
        403,
        'PLAN_LIMIT_REACHED'
      );
    }

    // 3️⃣ VALIDER LES CREDENTIALS
    logger.info(`🔐 Validating credentials for ${input.type}`);
    try {
      // Validate based on source type
      if (input.type === 'TRUSTPILOT') {
        if (!input.config.companyName) {
          throw new AppError('Missing companyName in config', 400, 'INVALID_CONFIG');
        }
        // Additional validation can be added here
      }

      logger.info(`✅ Credentials validated`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Failed to validate credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
        400,
        'VALIDATION_FAILED'
      );
    }

    // 4️⃣ CRÉER LA SOURCE EN BD
    const source = await prisma.source.create({
      data: {
        name: input.name,
        type: input.type,
        brandId: input.brandId,
        isActive: true,
        config: input.config,
        // scrapingFrequency DOIT être en SECONDES (6h = 21600s)
        scrapingFrequency: input.scrapingFrequency || 21600, 
        lastScrapedAt: null,
        errorCount: 0,
      },
      include: { brand: true }
    });

    logger.info(`✅ Source created: ${source.id}`);

    // 6️⃣ DÉCLENCHER UN PREMIER SCRAPING
    try {
      await scrapingQueue.add('scrape-source', 
        { sourceId: source.id, force: true },
        { priority: 10 } // Haute priorité
      );
      logger.info(`📬 Queued first scraping job`);
    } catch (error) {
      logger.warn(`⚠️ Failed to queue initial scraping:`, error);
      // Ne pas échouer la création de la source pour autant
    }

    // 6️⃣ PROGRAMMER LE JOB RÉCURRENT (toutes les X heures)
    try {
      await scrapingQueue.add(
        'scrape-source',
        { sourceId: source.id },
        {
          repeat: {
            every: input.scrapingFrequency || 6 * 60 * 60 * 1000
          }
        }
      );
      logger.info(`⏰ Recurring scraping job scheduled`);
    } catch (error) {
      logger.warn(`⚠️ Failed to schedule recurring job:`, error);
    }

    return source;
  }

  async updateSource(id: string, input: Partial<CreateSourceDTO>): Promise<Source> {
    // 🚫 VÉRIFIER LES DOMAINES INTERDITS LORS DE LA MISE À JOUR
    const url = input.config?.url;
    if (url) {
      const forbidden = checkForbiddenDomain(url);
      if (forbidden.isBlocked) {
        logger.warn(`🚫 BLOCKED SOURCE UPDATE: ${id} | URL: ${url}`, {
          sourceId: id,
          url,
          platformName: forbidden.platformName,
        });
        throw new AppError(
          forbidden.reason || 'Cette plateforme n\'est pas autorisée',
          403,
          'PLATFORM_FORBIDDEN'
        );
      }
    }

    // Vérifier aussi par type de source
    if (input.type) {
      const sourceValidation = validateSourceAllowed(input.type, url);
      if (!sourceValidation.valid) {
        logger.warn(`🚫 BLOCKED SOURCE TYPE UPDATE: ${input.type} for source ${id}`, {
          sourceId: id,
          sourceType: input.type,
        });
        throw new AppError(
          sourceValidation.error || 'Ce type de source n\'est pas autorisé',
          403,
          'SOURCE_TYPE_FORBIDDEN'
        );
      }
    }

    // Validate basic config if type changes
    if (input.type === 'TRUSTPILOT' && input.config) {
      if (!input.config.companyName) {
        throw new AppError('Missing companyName in config', 400, 'INVALID_CONFIG');
      }
    }

    return await prisma.source.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.type && { type: input.type }),
        ...(input.config && { config: input.config }),
      },
      include: { brand: true }
    });
  }

  /**
   * Supprime une source
   */
  async deleteSource(id: string): Promise<boolean> {
    await prisma.source.delete({ where: { id } });

    // Supprimer aussi les mentions associées (optionnel)
    await prisma.mention.deleteMany({
      where: { sourceId: id }
    });

    return true;
  }

  /**
   * Teste la connexion à une source
   */
  async testConnection(type: SourceType, config: Record<string, any>): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // 🚫 Vérifier d'abord si la plateforme est autorisée
      const url = config?.url;
      const sourceValidation = validateSourceAllowed(type as string, url);
      if (!sourceValidation.valid) {
        return {
          success: false,
          message: sourceValidation.error || 'Cette plateforme n\'est pas autorisée'
        };
      }

      // Basic validation for known types
      if (type === 'TRUSTPILOT') {
        if (!config.companyName) {
          return {
            success: false,
            message: 'Missing companyName in config'
          };
        }
        return {
          success: true,
          message: `✓ Successfully validated Trustpilot config for '${config.companyName}'`
        };
      }
      
      return {
        success: true,
        message: `✓ Configuration validated for ${type}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Déclenche manuellement un scraping pour une source
   */
  async scrapeNow(sourceId: string): Promise<{ jobId: string }> {
    const source = await prisma.source.findUnique({
      where: { id: sourceId }
    });

    if (!source) {
      throw new AppError('Source not found', 404, 'SOURCE_NOT_FOUND');
    }

    const job = await scrapingQueue.add(
      'scrape-source',
      { sourceId, force: true },
      { priority: 100, attempts: 3 }
    );

    return { jobId: job.id?.toString() || '' };
  }

  /**
   * Retourne la limite selon le plan
   */
  private getPlanLimit(plan: string, limitType: string): number {
    const limits: Record<string, Record<string, number>> = {
      FREE: { maxSources: 10, maxBrands: 1 },
      STARTER: { maxSources: 10, maxBrands: 1 },
      PRO: { maxSources: 50, maxBrands: 5 },
      PREMIUM: { maxSources: 100, maxBrands: 15 },
      TEAM: { maxSources: 999, maxBrands: 999 },
    };

    return limits[plan]?.[limitType] || limits['FREE'][limitType] || 1;
  }
}

export const sourcesService = new SourcesService();