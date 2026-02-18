import { prisma } from '../../shared/database/prisma.client';
import {
    GetAnalyticsInput,
    AnalyticsSummary,
    SentimentBreakdown,
    TimeSeriesData
} from './analytics.types';
import { Prisma } from '@sentinelle/database';
import { cacheService } from '../../infrastructure/cache/redis.service';

/**
 * 📈 Service Analytics
 * 
 * Fournit des statistiques et métriques agrégées basées sur les mentions réelles.
 */
class AnalyticsService {
    private CACHE_TTL = 900; // 15 minutes en secondes

    /**
     * ✅ Helper pour générer une clé de cache unique basée sur les filtres
     */
    private getCacheKey(prefix: string, input: GetAnalyticsInput): string {
        const parts = [
            'analytics',
            prefix,
            input.organizationId,
            input.brandId || 'all',
            input.startDate || 'any',
            input.endDate || 'any',
            input.period || 'none'
        ];
        return parts.join(':');
    }

    /**
     * Calcule un résumé global pour une organisation/marque
     */
    async getSummary(input: GetAnalyticsInput): Promise<AnalyticsSummary> {
        const cacheKey = this.getCacheKey('summary', input);

        return await cacheService.wrap(cacheKey, this.CACHE_TTL, async () => {
            const where: any = {
                brand: {
                    organizationId: input.organizationId
                }
            };

            if (input.brandId) {
                where.brandId = input.brandId;
            }

            if (input.startDate || input.endDate) {
                where.publishedAt = {};
                if (input.startDate) where.publishedAt.gte = new Date(input.startDate);
                if (input.endDate) where.publishedAt.lte = new Date(input.endDate);
            }

            const aggregations = await prisma.mention.aggregate({
                where,
                _count: {
                    id: true
                },
                _avg: {
                    sentimentScore: true
                },
                _sum: {
                    reachScore: true,
                    engagementCount: true
                }
            });

            return {
                totalMentions: aggregations._count.id || 0,
                averageSentiment: aggregations._avg.sentimentScore || 0,
                totalReach: aggregations._sum.reachScore || 0,
                totalEngagement: aggregations._sum.engagementCount || 0
            };
        });
    }

    /**
     * Récupère la répartition des sentiments
     */
    async getSentimentBreakdown(input: GetAnalyticsInput): Promise<SentimentBreakdown> {
        const cacheKey = this.getCacheKey('sentiment', input);

        return await cacheService.wrap(cacheKey, this.CACHE_TTL, async () => {
            const where: any = {
                brand: {
                    organizationId: input.organizationId
                }
            };

            if (input.brandId) where.brandId = input.brandId;
            if (input.startDate) {
                where.publishedAt = { ...where.publishedAt, gte: new Date(input.startDate) };
            }
            if (input.endDate) {
                where.publishedAt = { ...where.publishedAt, lte: new Date(input.endDate) };
            }

            const counts = await prisma.mention.groupBy({
                by: ['sentiment'],
                where,
                _count: {
                    id: true
                }
            });

            const result: SentimentBreakdown = {
                positive: 0,
                neutral: 0,
                negative: 0,
                total: 0
            };

            counts.forEach(c => {
                const count = c._count.id;
                result.total += count;
                if (c.sentiment === 'POSITIVE') result.positive = count;
                else if (c.sentiment === 'NEUTRAL') result.neutral = count;
                else if (c.sentiment === 'NEGATIVE') result.negative = count;
            });

            return result;
        });
    }

    /**
     * Récupère les données chronologiques (Time Series)
     * Utilise des requêtes brutes pour le groupement par date (SQL compatible PG)
     */
    async getTimeSeries(input: GetAnalyticsInput): Promise<TimeSeriesData[]> {
        const cacheKey = this.getCacheKey('timeseries', input);

        return await cacheService.wrap(cacheKey, this.CACHE_TTL, async () => {
            const period = input.period || 'daily';
            let interval = 'day';
            if (period === 'weekly') interval = 'week';
            if (period === 'monthly') interval = 'month';

            // Safe raw query: all user-provided values are parameterized.
            // Only `interval` is interpolated, but it is strictly whitelisted above.
            const timestampExpr = Prisma.sql`date_trunc(${Prisma.raw(`'${interval}'`)}, "publishedAt")`;

            const orgId = input.organizationId;
            const brandId = input.brandId || null;
            const startDate = input.startDate ? new Date(input.startDate) : null;
            const endDate = input.endDate ? new Date(input.endDate) : null;

            const data = await prisma.$queryRaw<any[]>(Prisma.sql`
                SELECT 
                    ${timestampExpr} as timestamp,
                    COUNT(id)::int as count,
                    AVG("sentimentScore") as sentiment
                FROM mentions
                WHERE "brandId" IN (SELECT id FROM brands WHERE "organizationId" = ${orgId})
                  AND (${brandId}::text IS NULL OR "brandId" = ${brandId})
                  AND (${startDate}::timestamptz IS NULL OR "publishedAt" >= ${startDate})
                  AND (${endDate}::timestamptz IS NULL OR "publishedAt" <= ${endDate})
                GROUP BY timestamp
                ORDER BY timestamp ASC
            `);

            return data.map(d => ({
                timestamp: d.timestamp,
                count: d.count,
                sentiment: d.sentiment
            }));
        });
    }

    /**
     * Extrait les mots les plus fréquents (Word Cloud) - Version simplifiée
     */
    async getWordCloud(input: GetAnalyticsInput): Promise<{ word: string, count: number }[]> {
        const cacheKey = this.getCacheKey('wordcloud', input);

        return await cacheService.wrap(cacheKey, this.CACHE_TTL, async () => {
            const where: any = {
                brand: { organizationId: input.organizationId }
            };
            if (input.brandId) where.brandId = input.brandId;

            // Récupérer les 100 dernières mentions pour analyse (pour éviter de surcharger)
            const mentions = await prisma.mention.findMany({
                where,
                select: { content: true },
                take: 1000,
                orderBy: { publishedAt: 'desc' }
            });

            const words: Record<string, number> = {};
            const stopWords = new Set(['le', 'la', 'les', 'de', 'des', 'un', 'une', 'et', 'est', 'du', 'en', 'pour', 'que', 'qui', 'dans']);

            mentions.forEach(m => {
                const tokens = m.content.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .split(/\s+/)
                    .filter(t => t.length > 3 && !stopWords.has(t));

                tokens.forEach(t => {
                    words[t] = (words[t] || 0) + 1;
                });
            });

            return Object.entries(words)
                .map(([word, count]) => ({ word, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 50);
        });
    }

    /**
     * ✅ Invalide toutes les données analytics d'une organisation
     */
    async invalidateCache(organizationId: string): Promise<void> {
        await cacheService.delPattern(`analytics:*:*:${organizationId}:*`);
    }
}

export const analyticsService = new AnalyticsService();
