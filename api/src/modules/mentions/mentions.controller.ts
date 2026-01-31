import { Request, Response, NextFunction } from 'express';
import { mentionsService } from './mentions.service';
import { Logger } from '../../shared/logger';
import { AppError } from '@/shared/utils/errors';
import { prisma } from '@/shared/database/prisma.client';

class MentionsController {
        async getMentionById(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { id } = req.params;
                const mention = await mentionsService.getMentionById(id);
                if (!mention) {
                    res.status(404).json({ success: false, message: 'Mention not found' });
                    return;
                }
                res.status(200).json({ success: true, data: mention });
            } catch (error) {
                next(error);
            }
        }

        async createMention(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const data = req.body;
                const mention = await mentionsService.createMention(data);
                res.status(201).json({ success: true, data: mention });
            } catch (error) {
                next(error);
            }
        }

        async updateMention(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { id } = req.params;
                const data = req.body;
                const updated = await mentionsService.updateMention(id, data);
                if (!updated) {
                    res.status(404).json({ success: false, message: 'Mention not found' });
                    return;
                }
                res.status(200).json({ success: true, data: updated });
            } catch (error) {
                next(error);
            }
        }
    /**
     * Recherche avancée - Require auth pour sécurité
     */
    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as any;
            if (!user?.organizationId) {
                throw new AppError('User not associated with an organization', 403, 'NO_ORGANIZATION');
            }

            // Force l'organisationId du user pour éviter les fuites cross-org
            const filters = {
                ...req.body,
                organizationId: user.organizationId
            };
            const results = await mentionsService.search(filters);
            res.status(200).json({ success: true, data: results });
            return;
        } catch (error) {
            Logger.error(
                'Erreur lors de la recherche de mentions',
                error as Error,
                {
                    composant: 'MentionsController',
                    operation: 'search',
                    userId: req.user ? (req.user as any).id : undefined
                }
            );
            next(error);
            return;
        }
    }

    /**
     * Actions groupées
     */
    async batchAction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { ids, action, sentiment } = req.body;
            const result = await mentionsService.batchAction(ids, action, sentiment);
            res.status(200).json({ success: true, data: result });
            return;
        } catch (error) {
            Logger.error(
                'Erreur lors de l\'action groupée sur les mentions',
                error as Error,
                {
                    composant: 'MentionsController',
                    operation: 'batchAction',
                    userId: req.user ? (req.user as any).id : undefined
                }
            );
            next(error);
            return;
        }
    }

    async getAllMentions(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!_req.user?.organizationId) {
                throw new AppError('User not associated with an organization', 403, 'NO_ORGANIZATION');
            }
            const mentions = await mentionsService.getAllMentions(_req.user.organizationId);
            res.status(200).json({
                success: true,
                data: mentions,
                count: mentions.length,
            });
            return;
        } catch (error) {
            Logger.error(
                'Erreur lors de la récupération de toutes les mentions',
                error as Error,
                {
                    composant: 'MentionsController',
                    operation: 'getAllMentions',
                    userId: _req.user ? (_req.user as any).id : undefined
                }
            );
            next(error);
            return;
        }
    }

    async getMentions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔍 [MENTIONS] Request received');
            console.log('📋 Query params:', req.query);
            console.log('👤 User:', req.user?.email);
            console.log('🏢 Organization:', req.user?.organizationId);

            const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : Array.isArray(req.query.brandId) ? req.query.brandId[0] : undefined;
            const pageNum = Number(req.query.page) || 1;
            const limitNum = Number(req.query.limit) || 20;
            const { sentiment, platform, startDate, endDate } = req.query;

            if (!brandId) {
                res.status(400).json({ success: false, message: 'brandId is required and must be a string' });
                return;
            }

            // Vérifier que la marque appartient à l'utilisateur
            const brand = await prisma.brand.findFirst({
                where: {
                    id: brandId,
                    organization: { ownerId: (req.user as any).id }
                }
            });

            if (!brand) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }

            // Construire les filtres
            const where: any = { brandId };
            if (sentiment) {
                where.sentiment = sentiment;
            }
            if (platform) {
                where.platform = platform;
            }
            if (startDate || endDate) {
                where.publishedAt = {};
                if (startDate) where.publishedAt.gte = new Date(startDate as string);
                if (endDate) where.publishedAt.lte = new Date(endDate as string);
            }

            // Récupérer les mentions avec pagination
            const [mentions, total] = await Promise.all([
                prisma.mention.findMany({
                    where,
                    orderBy: { publishedAt: 'desc' },
                    skip: (pageNum - 1) * limitNum,
                    take: limitNum
                }),
                prisma.mention.count({ where })
            ]);

            // Calculer les stats
            // groupBy can return 'true' or the object, so filter and cast
            const statsRaw = await prisma.mention.groupBy({
                by: ['sentiment'],
                where: { brandId },
                _count: { sentiment: true }
            });
            type GroupedStat = { sentiment: string; _count: { sentiment: number } };
            const statsArr = (statsRaw as GroupedStat[]).filter(s => typeof s === 'object' && s !== null && 'sentiment' in s && '_count' in s);
            const statsFormatted = {
                positive: statsArr.find(s => s.sentiment === 'POSITIVE')?._count.sentiment || 0,
                neutral: statsArr.find(s => s.sentiment === 'NEUTRAL')?._count.sentiment || 0,
                negative: statsArr.find(s => s.sentiment === 'NEGATIVE')?._count.sentiment || 0,
                mixed: statsArr.find(s => s.sentiment === 'MIXED')?._count.sentiment || 0
            };

            console.log('✅ Mentions found:', mentions.length);
            console.log('📊 Stats:', statsFormatted);

            res.json({
                success: true,
                data: {
                    mentions,
                    pagination: {
                        total,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(total / limitNum)
                    },
                    stats: statsFormatted
                }
            });
            return;
        } catch (error) {
            Logger.error(
                'Erreur lors de la récupération des mentions filtrées',
                error as Error,
                {
                    composant: 'MentionsController',
                    operation: 'getMentions',
                    userId: req.user ? (req.user as any).id : undefined
                }
            );
            console.error('❌ [MENTIONS] Error:', error);
            next(error);
            return;
        }
    }

    async deleteMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await mentionsService.deleteMention(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Mention not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Mention deleted successfully' });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }
}

export const mentionsController = new MentionsController();
