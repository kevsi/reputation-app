import cron from 'node-cron';
import { logger } from '@/infrastructure/logger';
import { mentionsArchivingService } from '@/modules/mentions/mentions.archiving.service';

/**
 * 📦 Scheduler d'Archivage Automatique
 * 
 * Exécute l'archivage des vieilles mentions tous les jours à 2h du matin
 */
export function startArchivingScheduler() {
    logger.info('📦 Starting archiving scheduler (runs daily at 2:00 AM)');

    // Tous les jours à 2h du matin
    cron.schedule('0 2 * * *', async () => {
        try {
            logger.info('⏰ Starting scheduled archiving task...');
            const result = await mentionsArchivingService.runArchiving();
            logger.info('✅ Scheduled archiving task completed', result);
        } catch (error) {
            logger.error('❌ Scheduled archiving task failed:', error);
        }
    });

    logger.info('✅ Archiving scheduler started successfully');
}
