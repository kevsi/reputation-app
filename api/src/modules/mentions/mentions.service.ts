import { CreateMentionInput, UpdateMentionInput } from './mentions.validation';
import { SentimentType } from '@sentinelle/database';
import { PaginationParams, PaginatedResponse } from '@/shared/utils/pagination';
import { MentionsRepository, mentionsRepository } from './mentions.repository';
import { cacheService } from '../../infrastructure/cache/redis.service';
import { analyticsService } from '../analytics/analytics.service';
import { prisma } from '@/shared/database/prisma.client';

class MentionsService {
    private CACHE_TTL = 300; // 5 minutes

    constructor(private repository: MentionsRepository) { }

    /**
     * Recherche avancée de mentions avec Cache
     */
    async search(filters: any) {
        const {
            brandId,
            organizationId,
            sentiment,
            startDate,
            endDate,
            searchTerm,
            language,
            sourceType,
            isProcessed,
            page = 1,
            limit = 20
        } = filters;

        // Générer une clé de cache basée sur les filtres
        const cacheKey = `mentions:search:${JSON.stringify(filters)}`;

        return await cacheService.wrap(cacheKey, this.CACHE_TTL, async () => {
            const where: any = {};

            if (brandId) where.brandId = brandId;
            if (organizationId) where.brand = { organizationId };
            if (sentiment && sentiment.length > 0) where.sentiment = { in: sentiment };
            if (language) where.language = language;
            if (isProcessed !== undefined) where.isProcessed = isProcessed;

            if (startDate || endDate) {
                where.publishedAt = {};
                if (startDate) where.publishedAt.gte = new Date(startDate);
                if (endDate) where.publishedAt.lte = new Date(endDate);
            }

            if (searchTerm) {
                where.content = { contains: searchTerm, mode: 'insensitive' };
            }

            if (sourceType && sourceType.length > 0) {
                where.source = { type: { in: sourceType } };
            }

            const skip = (page - 1) * limit;

            const [mentions, total] = await Promise.all([
                this.repository.findMany(where, skip, limit, { publishedAt: 'desc' }),
                this.repository.count(where)
            ]);

            return {
                mentions,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        });
    }

    /**
     * Actions groupées
     */
    async batchAction(ids: string[], action: 'DELETE' | 'MARK_PROCESSED' | 'UPDATE_SENTIMENT', sentiment?: SentimentType) {
        const result = await (async () => {
            switch (action) {
                case 'DELETE':
                    return await this.repository.deleteMany(ids);
                case 'MARK_PROCESSED':
                    return await this.repository.updateMany(ids, { isProcessed: true });
                case 'UPDATE_SENTIMENT':
                    if (!sentiment) throw new Error('Sentiment is required for UPDATE_SENTIMENT action');
                    return await this.repository.updateMany(ids, { sentiment });
            }
        })();

        // Invalidation globale de l'analytics
        if (ids.length > 0) {
            const firstMention = await this.repository.findById(ids[0]);
            if (firstMention?.brand?.organizationId) {
                await analyticsService.invalidateCache(firstMention.brand.organizationId);
            }
        }

        return result;
    }

    /**
     * ✅ Récupérer toutes les mentions avec pagination et Cache
     */
    async getAllMentions(
        organizationId: string,
        pagination: PaginationParams,
        brandId?: string
    ): Promise<PaginatedResponse<any>> {
        const cacheKey = `mentions:list:${organizationId}:${brandId || 'all'}:${JSON.stringify(pagination)}`;

        const result = await cacheService.wrap<PaginatedResponse<any>>(cacheKey, this.CACHE_TTL, async () => {
            const where: any = { brand: { organizationId } };
            if (brandId) where.brandId = brandId;
            const page = Math.max(1, pagination.page || 1);
            const limit = Math.min(100, Math.max(1, pagination.limit || 20));
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.repository.findMany(where, skip, limit),
                this.repository.count(where)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        });

        return result;
    }

    /**
     * ✅ Récupérer une mention par son ID
     */
    async getMentionById(id: string) {
        return await this.repository.findById(id);
    }

    /**
     * Créer une mention à partir des données scrapées (PROMPT)
     */
    async createFromScraper(input: {
        sourceId: string;
        brandId: string;
        externalId: string;
        content: string;
        author?: string;
        authorAvatar?: string;
        publishedAt: Date;
        url?: string;
        metadata?: Record<string, any>;
    }) {
        const { sourceId, brandId, externalId, content, author, publishedAt, url, metadata } = input;

        const source = await prisma.source.findUnique({
            where: { id: sourceId },
            select: { type: true }
        });

        if (!source) {
            throw new Error('Source not found');
        }

        const data: any = {
            brandId,
            sourceId,
            content,
            platform: source.type,
            externalId,
            publishedAt,
            author: author || 'Unknown',
            url: url || '',
        };

        if (metadata?.rating !== undefined) data.sentimentScore = metadata.rating / 5;
        if (metadata) data.rawData = metadata;

        const mention = await this.repository.create(data);

        const mentionWithBrand = await this.repository.findById(mention.id);
        if (mentionWithBrand?.brand?.organizationId) {
            await analyticsService.invalidateCache(mentionWithBrand.brand.organizationId);
        }

        return mention;
    }

    /**
     * ✅ Création d'une mention
     */
    async createMention(input: CreateMentionInput) {
        const data: any = {
            brandId: input.brandId,
            sourceId: input.sourceId,
            content: input.content,
            platform: input.platform,
            externalId: input.externalId,
            publishedAt: input.publishedAt,
            sentiment: input.sentiment as SentimentType
        };

        if (input.url) data.url = input.url;
        if (input.language) data.language = input.language;
        if (input.author) data.author = input.author;
        if (input.authorUrl) data.authorUrl = input.authorUrl;
        if (input.sentimentScore !== undefined) data.sentimentScore = input.sentimentScore;

        const mention = await this.repository.create(data);

        // Invalider le cache analytics
        const mentionWithBrand = await this.repository.findById(mention.id);
        if (mentionWithBrand?.brand?.organizationId) {
            await analyticsService.invalidateCache(mentionWithBrand.brand.organizationId);
        }

        return mention;
    }

    /**
     * ✅ Mise à jour d'une mention
     */
    async updateMention(id: string, input: UpdateMentionInput) {
        const mention = await this.repository.update(id, {
            ...input,
            sentiment: input.sentiment as SentimentType
        });

        // Invalider le cache analytics
        const mentionWithBrand = await this.repository.findById(id);
        if (mentionWithBrand?.brand?.organizationId) {
            await analyticsService.invalidateCache(mentionWithBrand.brand.organizationId);
        }

        return mention;
    }

    /**
     * ✅ Suppression d'une mention
     */
    async deleteMention(id: string) {
        // Récupérer l'orgId avant suppression pour l'invalidation
        const mentionWithBrand = await this.repository.findById(id);
        const orgId = mentionWithBrand?.brand?.organizationId;

        await this.repository.delete(id);

        if (orgId) {
            await analyticsService.invalidateCache(orgId);
        }

        return true;
    }
}

export const mentionsService = new MentionsService(mentionsRepository);
