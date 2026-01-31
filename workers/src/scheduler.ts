/**
 * 🕐 Scheduler pour le scraping automatique
 *
 * Planifie les tâches de scraping pour toutes les sources actives
 * selon leur fréquence configurée
 */

import * as cron from 'node-cron';
import { PrismaClient } from '@sentinelle/database';
import { scrapingQueue } from './config/queues';

const prisma = new PrismaClient();

class ScrapingScheduler {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  async start() {
    console.log('🕐 Démarrage du scheduler de scraping...');

    // Planifier la vérification des sources toutes les minutes
    cron.schedule('* * * * *', async () => {
      await this.checkAndScheduleSources();
    });

    // Démarrage immédiat
    await this.checkAndScheduleSources();

    console.log('✅ Scheduler démarré.');
  }

  async stop() {
    console.log('🛑 Arrêt du scheduler...');

    for (const [sourceId, job] of this.scheduledJobs) {
      job.stop();
      console.log(`🛑 Job arrêté pour source ${sourceId}`);
    }

    this.scheduledJobs.clear();
    console.log('✅ Scheduler arrêté.');
  }

  private async checkAndScheduleSources() {
    try {
      // Récupérer toutes les sources actives
      const activeSources = await prisma.source.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          scrapingFrequency: true,
          lastScrapedAt: true,
        }
      });

      console.log(`📊 Vérification de ${activeSources.length} sources actives`);

      for (const source of activeSources) {
        await this.scheduleSourceScraping(source);
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des sources:', error);
    }
  }

  private async scheduleSourceScraping(source: any) {
    const now = new Date();
    const lastScraped = source.lastScrapedAt;
    const frequencySeconds = source.scrapingFrequency || 3600; // Défaut 1h

    // Vérifier si c'est le moment de scraper
    const shouldScrape = !lastScraped ||
      (now.getTime() - lastScraped.getTime()) >= (frequencySeconds * 1000);

    if (shouldScrape) {
      try {
        // Ajouter le job à la queue
        await scrapingQueue.add(
          'scrape-source',
          { sourceId: source.id },
          {
            priority: 1,
            removeOnComplete: 10,
            removeOnFail: 5,
          }
        );

        // Mettre à jour lastScrapedAt
        await prisma.source.update({
          where: { id: source.id },
          data: { lastScrapedAt: now }
        });

        console.log(`🚀 Scraping planifié pour ${source.name} (${source.type})`);

      } catch (error) {
        console.error(`❌ Erreur lors du scheduling de ${source.name}:`, error);
      }
    }
  }
}

// Instance globale
export const scrapingScheduler = new ScrapingScheduler();