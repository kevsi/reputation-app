/**
 * Script pour configurer des sources actives avec scraping automatique
 */

import { PrismaClient, SourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function setupActiveSources() {
  console.log('🔧 Configuration des sources actives pour le scraping automatique...');

  try {
    // 1. Récupérer l'organisation existante
    const org = await prisma.organization.findFirst();
    if (!org) {
      throw new Error('Aucune organisation trouvée. Lancez d\'abord le seed.');
    }

    // 2. Récupérer ou créer une marque de test
    let brand = await prisma.brand.findFirst({
      where: { organizationId: org.id }
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: 'Test Brand',
          description: 'Marque de test pour le scraping',
          website: 'https://example.com',
          keywords: ['test', 'brand', 'example'],
          organizationId: org.id,
        }
      });
      console.log('🏷️ Marque de test créée.');
    }

    // 3. Créer des sources actives avec configurations
    const sourcesData = [
      {
        name: 'Trustpilot Test',
        type: SourceType.TRUSTPILOT,
        url: 'https://www.trustpilot.com/review/example.com',
        config: {
          companyName: 'example.com', // Nom de domaine pour Trustpilot
          scrapingFrequency: 3600, // 1 heure
        },
        isActive: true,
      },
      {
        name: 'Twitter Test',
        type: SourceType.TWITTER,
        url: 'https://twitter.com/example',
        config: {
          apiKey: 'test_api_key', // À remplacer par de vraies clés
          apiSecret: 'test_api_secret',
          bearerToken: 'test_bearer_token',
          scrapingFrequency: 1800, // 30 minutes
        },
        isActive: true,
      },
      {
        name: 'Reddit Test',
        type: SourceType.REDDIT,
        url: 'https://reddit.com/r/test',
        config: {
          subreddit: 'test',
          scrapingFrequency: 3600,
        },
        isActive: true,
      }
    ];

    for (const sourceData of sourcesData) {
      const existingSource = await prisma.source.findFirst({
        where: {
          name: sourceData.name,
          brandId: brand.id
        }
      });

      if (!existingSource) {
        await prisma.source.create({
          data: {
            ...sourceData,
            brandId: brand.id,
          }
        });
        console.log(`📡 Source ${sourceData.name} créée.`);
      } else {
        await prisma.source.update({
          where: { id: existingSource.id },
          data: {
            config: sourceData.config,
            isActive: sourceData.isActive,
            scrapingFrequency: sourceData.config.scrapingFrequency,
          }
        });
        console.log(`📡 Source ${sourceData.name} mise à jour.`);
      }
    }

    // 4. Vérifier les sources actives
    const activeSources = await prisma.source.findMany({
      where: { isActive: true },
      include: { brand: true }
    });

    console.log(`✅ ${activeSources.length} sources actives configurées:`);
    activeSources.forEach(source => {
      console.log(`  - ${source.name} (${source.type})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupActiveSources();