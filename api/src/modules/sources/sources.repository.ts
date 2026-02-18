/**
 * Repository Sources - Accès base de données Prisma
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { prisma } from '@/shared/database/prisma.client';
import type { Prisma } from '@prisma/client';

export class SourcesRepository {
  /**
   * Récupérer toutes les sources d'une brand
   */
  async findByBrandId(brandId: string) {
    return prisma.source.findMany({
      where: {
        brandId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        brand: {
          include: {
            organization: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer une source par ID
   */
  async findById(sourceId: string) {
    return prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        brand: {
          include: {
            organization: true,
          },
        },
      },
    });
  }

  /**
   * Créer une nouvelle source
   */
  async create(data: Prisma.SourceCreateInput) {
    return prisma.source.create({
      data,
      include: {
        brand: true,
      },
    });
  }

  /**
   * Mettre à jour une source
   */
  async update(sourceId: string, data: Prisma.SourceUpdateInput) {
    return prisma.source.update({
      where: { id: sourceId },
      data,
      include: {
        brand: true,
      },
    });
  }

  /**
   * Récupérer les sources à scraper (pour le scheduler)
   */
  async findPendingSources() {
    const now = new Date();

    const sources = await prisma.source.findMany({
      where: {
        isActive: true,
      },
      include: {
        brand: true,
      },
    });

    return sources.filter((source) => {
      const lastScraped = source.lastScrapedAt?.getTime() || 0;
      const frequencyMs = (source.scrapingFrequency || 21600) * 1000;
      const nextScrape = lastScraped + frequencyMs;
      return now.getTime() >= nextScrape;
    });
  }

  /**
   * Mettre à jour le statut de scraping
   */
  async updateScrapingStatus(
    sourceId: string,
    data: {
      lastScrapedAt: Date;
      nextScrapingAt?: Date;
      lastScrapingError?: string | null;
      isActive?: boolean;
      errorCount?: number;
    }
  ) {
    const updateData: Prisma.SourceUpdateInput = {
      lastScrapedAt: data.lastScrapedAt,
      lastError: data.lastScrapingError ?? undefined,
    };

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.errorCount !== undefined) {
      updateData.errorCount = data.errorCount;
    }

    return prisma.source.update({
      where: { id: sourceId },
      data: updateData,
      include: {
        brand: true,
      },
    });
  }

  /**
   * Compter les sources actives d'une brand
   */
  async countByBrand(brandId: string, excludeDeleted = true) {
    return prisma.source.count({
      where: {
        brandId,
        ...(excludeDeleted && { isActive: true }),
      },
    });
  }
}

export const sourcesRepository = new SourcesRepository();
