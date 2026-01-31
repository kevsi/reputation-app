import { prisma } from '../../shared/database/prisma.client';
import { CreateMentionInput, UpdateMentionInput } from './mentions.validation';
import { SentimentType } from '@sentinelle/database';

class MentionsService {
    /**
     * Recherche avancée de mentions
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
            prisma.mention.findMany({
                where,
                include: { source: true, brand: true },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.mention.count({ where })
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
    }

    /**
     * Actions groupées
     */
    async batchAction(ids: string[], action: 'DELETE' | 'MARK_PROCESSED' | 'UPDATE_SENTIMENT', sentiment?: SentimentType) {
        switch (action) {
            case 'DELETE':
                return await prisma.mention.deleteMany({
                    where: { id: { in: ids } }
                });
            case 'MARK_PROCESSED':
                return await prisma.mention.updateMany({
                    where: { id: { in: ids } },
                    data: { isProcessed: true }
                });
            case 'UPDATE_SENTIMENT':
                if (!sentiment) throw new Error('Sentiment is required for UPDATE_SENTIMENT action');
                return await prisma.mention.updateMany({
                    where: { id: { in: ids } },
                    data: { sentiment }
                });
        }
    }

    async getAllMentions(organizationId: string) {
        return await prisma.mention.findMany({
            where: {
                brand: {
                    organizationId: organizationId
                }
            },
            include: { source: true, brand: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }

    async getMentionById(id: string) {
        return await prisma.mention.findUnique({
            where: { id },
            include: { source: true, brand: true }
        });
    }

    async createMention(input: CreateMentionInput) {
        // Filtrer les champs undefined pour éviter les erreurs de type Prisma
        const data: any = {
            brandId: input.brandId,
            sourceId: input.sourceId,
            content: input.content,
            platform: input.platform,
            externalId: input.externalId,
            publishedAt: input.publishedAt,
            sentiment: input.sentiment as SentimentType
        };

        // Ajouter les champs optionnels seulement s'ils sont définis
        if (input.url) data.url = input.url;
        if (input.language) data.language = input.language;
        if (input.author) data.author = input.author;
        if (input.authorUrl) data.authorUrl = input.authorUrl;
        if (input.sentimentScore !== undefined) data.sentimentScore = input.sentimentScore;

        return await prisma.mention.create({
            data
        });
    }

    async updateMention(id: string, input: UpdateMentionInput) {
        return await prisma.mention.update({
            where: { id },
            data: {
                ...input,
                sentiment: input.sentiment as SentimentType
            }
        });
    }

    async deleteMention(id: string) {
        await prisma.mention.delete({ where: { id } });
        return true;
    }
}

export const mentionsService = new MentionsService();
