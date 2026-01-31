/**
 * Script pour déclencher un scraping manuel de toutes les sources actives
 * Fonctionne dans un conteneur Docker
 */

import { PrismaClient } from '@sentinelle/database';
import { scrapingQueue } from './src/config/queues';

const prisma = new PrismaClient();

async function triggerManualScraping() {
  console.log('🚀 Déclenchement du scraping manuel...');

  try {
    // Récupérer toutes les sources actives
    const activeSources = await prisma.source.findMany({
      where: { isActive: true },
      include: { brand: true }
    });

    if (activeSources.length === 0) {
      console.log('⚠️ Aucune source active trouvée. Configurez d\'abord des sources avec `npm run setup:sources`');
      return;
    }

    console.log(`📊 Scraping de ${activeSources.length} sources actives:`);

    // Déclencher le scraping pour chaque source
    for (const source of activeSources) {
      try {
        await scrapingQueue.add(
          'scrape-source',
          { sourceId: source.id },
          {
            priority: 1,
            removeOnComplete: 10,
            removeOnFail: 5,
          }
        );

        console.log(`✅ Job ajouté pour ${source.name} (${source.type}) - Marque: ${source.brand.name}`);

        // Mettre à jour lastScrapedAt
        await prisma.source.update({
          where: { id: source.id },
          data: { lastScrapedAt: new Date() }
        });

      } catch (error) {
        console.error(`❌ Erreur pour ${source.name}:`, error);
      }
    }

    console.log('🎉 Tous les jobs de scraping ont été ajoutés à la queue!');
    console.log('📋 Vérifiez les logs des workers pour suivre la progression.');

  } catch (error) {
    console.error('❌ Erreur lors du déclenchement du scraping:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

triggerManualScraping();