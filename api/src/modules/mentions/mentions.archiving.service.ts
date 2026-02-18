import { prisma } from '../../shared/database/prisma.client';
import { logger } from '../../infrastructure/logger';
import { analyticsService } from '../analytics/analytics.service';
import fs from 'fs/promises';
import path from 'path';

/**
 * 📦 Service d'Archivage des Mentions
 * 
 * Responsable de déplacer les vieilles mentions vers un stockage à froid
 * et de les supprimer de la base de données principale.
 */
class MentionsArchivingService {
    private ARCHIVE_THRESHOLD_DAYS = 365; // 1 an par défaut
    private BATCH_SIZE = 1000;

    /**
     * ✅ Exécute l'archivage global
     */
    async runArchiving(): Promise<{ archived: number, deleted: number }> {
        logger.info('📦 Starting mentions archiving process...');

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - this.ARCHIVE_THRESHOLD_DAYS);

        let totalArchived = 0;
        let totalDeleted = 0;

        try {
            // 1. Identifier les mentions à archiver
            const mentionsCount = await prisma.mention.count({
                where: {
                    publishedAt: {
                        lt: thresholdDate
                    }
                }
            });

            if (mentionsCount === 0) {
                logger.info('ℹ️ No mentions to archive');
                return { archived: 0, deleted: 0 };
            }

            logger.info(`📊 Found ${mentionsCount} mentions to archive (older than ${thresholdDate.toISOString()})`);

            // 2. Traiter par lots
            // Dans une version réelle, on pourrait exporter en JSON et uploader vers S3
            // Ici, on va simuler l'export

            const mentions = await prisma.mention.findMany({
                where: {
                    publishedAt: {
                        lt: thresholdDate
                    }
                },
                take: this.BATCH_SIZE,
                include: {
                    brand: true,
                    source: true
                }
            });

            if (mentions.length > 0) {
                // Simulation d'écriture de fichier d'archive
                const archiveData = JSON.stringify(mentions, null, 2);
                const archiveName = `archive_mentions_${Date.now()}.json`;
                const archivePath = path.join(process.cwd(), 'archives', archiveName);

                // S'assurer que le dossier archives existe
                await fs.mkdir(path.dirname(archivePath), { recursive: true });
                await fs.writeFile(archivePath, archiveData);

                logger.info(`💾 Mentions exported to ${archiveName}`);

                // 3. Suppression de la DB
                const ids = mentions.map(m => m.id);
                const deleteResult = await prisma.mention.deleteMany({
                    where: {
                        id: {
                            in: ids
                        }
                    }
                });

                totalArchived = mentions.length;
                totalDeleted = deleteResult.count;

                // 4. Invalider les caches analytics pour les organisations affectées
                const orgIds = new Set(mentions.map(m => m.brand.organizationId));
                for (const orgId of orgIds) {
                    await analyticsService.invalidateCache(orgId);
                }
            }

            logger.info(`✅ Archiving completed: ${totalArchived} archived, ${totalDeleted} deleted from DB`);
            return { archived: totalArchived, deleted: totalDeleted };

        } catch (error) {
            logger.error('❌ Error during archiving:', error);
            throw error;
        }
    }
}

export const mentionsArchivingService = new MentionsArchivingService();
