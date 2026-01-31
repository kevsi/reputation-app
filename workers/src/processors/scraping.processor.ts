/**
 * 🕵️ Scraping Processor
 * 
 * Orchestration de la collecte:
 * 1. Charge la source de la BD
 * 2. Valide que le collector est activé (auto-désactive sinon)
 * 3. Lance le collector approprié
 * 4. Enqueue chaque mention pour traitement
 */

import { Job } from 'bullmq'
import { PrismaClient } from '@sentinelle/database'
import { CollectorFactory } from '../collectors'
import { mentionQueue } from '../lib/queues'
import { MentionJobData } from './mention.processor'
import { Source } from '@sentinelle/database'
import { validateSourceBeforeScraping } from '../lib/forbidden-domains'
import { isCollectorEnabled, getCollectorReason, isValidCollectorType, getUnavailableCollectorMessage } from '../config/collectors.config'

const prisma = new PrismaClient();

export interface ScrapingJobData {
  sourceId: string;
  brandId?: string;
  force?: boolean;
}

/**
 * Processeur principal pour les jobs de scraping
 * Effectue une validation complète avant de scraper
 */
export async function scrapingProcessor(job: Job<ScrapingJobData>) {
  const { sourceId, force } = job.data;

  console.log(`\n🕵️ Scraping source: ${sourceId}`);

  try {
    // 1️⃣ CHARGER LA SOURCE
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            keywords: true
          }
        }
      },
    });

    if (!source) {
      console.error(`❌ Source ${sourceId} not found`);
      throw new Error(`Source ${sourceId} not found`);
    }

    console.log(`   📍 Type: ${source.type}`);

    // 🚫 VÉRIFIER QUE LA SOURCE N'EST PAS INTERDITE (niveau domain)
    const configUrl = (source.config as any)?.url as string | undefined;
    const validation = validateSourceBeforeScraping(source.type, configUrl);
    if (!validation.valid) {
      const errorMsg = `🚫 FORBIDDEN SOURCE: ${source.id} - ${validation.reason}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // 🔍 PHASE 1 : Valider que le type est reconnu
    if (!isValidCollectorType(source.type)) {
      const message = getUnavailableCollectorMessage(source.type);
      console.error(`\n${message}`);
      throw new Error(message);
    }

    // 🔍 PHASE 2 : Valider que le collector est activé
    if (!isCollectorEnabled(source.type)) {
      const reason = getCollectorReason(source.type as any);
      const errorMsg = `🚫 Collector "${source.type}" is disabled: ${reason || 'Unknown reason'}\n   Source ${sourceId} has been automatically deactivated.`;
      
      console.error(`\n${errorMsg}`);
      
      // AUTO-DÉSACTIVER LA SOURCE SI LE COLLECTOR EST INTERDIT
      await prisma.source.update({
        where: { id: sourceId },
        data: { isActive: false }
      });

      throw new Error(errorMsg);
    }

    console.log(`   ✅ Collector type is valid and enabled`);

    // 2️⃣ VÉRIFIER QUE LA SOURCE EST ACTIVE
    if (!source.isActive && !force) {
      console.log(`⏭️ Source ${sourceId} is inactive, skipping`);
      return { skipped: true };
    }

    // 3️⃣ VÉRIFIER QUE LA MARQUE A DES MOTS-CLÉS
    let keywords = source.brand.keywords;
    if (!keywords || keywords.length === 0) {
      if (!source.brand.name || source.brand.name.trim() === '') {
        const errorMsg = `Brand ${source.brandId} has no keywords and no name. Cannot proceed with scraping.`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      console.warn(`⚠️ Brand ${source.brandId} has no keywords, using brand name as default`);
      keywords = [source.brand.name];
    }

    console.log(`🔑 Keywords to search: ${keywords.join(', ')}`);

    // 4️⃣ OBTENIR LE COLLECTOR
    const collector = CollectorFactory.getCollector(source.type);
    console.log(`🏭 Using ${source.type} collector`);

    // 5️⃣ COLLECTER LES MENTIONS
    let mentions: MentionJobData[] = [];
    try {
      const rawMentions = await collector.collect(source as Source, keywords);

      if (!rawMentions || rawMentions.length === 0) {
        console.warn(`⚠️ Collector returned no mentions for source ${source.id} (${source.type})`);
        // Continue même si aucune mention - ce n'est pas une erreur
        mentions = [];
      } else {
        mentions = rawMentions.map((raw) => ({
          content: raw.text,
          author: raw.author || 'Anonymous', // Fallback pour éviter null
          authorUrl: raw.authorUrl,
          authorAvatar: raw.authorAvatar,
          url: raw.url,
          publishedAt: raw.publishedAt,
          externalId: raw.externalId,
          platform: raw.platform,
          engagementCount: raw.engagementCount,
          rawData: raw.rawData,
          brandId: source.brandId,
          sourceId: source.id,
        }));

        console.log(`📊 Collected ${mentions.length} mentions from ${source.type}`);
      }
    } catch (error) {
      console.error(`❌ Collection failed for ${source.type}:`, error);
      
      // Log l'erreur sans arrêter complètement
      try {
        await prisma.source.update({
          where: { id: sourceId },
          data: {
            lastError: error instanceof Error ? error.message : 'Unknown collection error',
            errorCount: { increment: 1 }
          }
        });
      } catch (dbError) {
        console.error('Failed to log error to source:', dbError);
      }
      
      throw error; // Re-throw pour que BullMQ retry
    }

    // 6️⃣ ENQUEUE LES MENTIONS POUR TRAITEMENT
    let enqueuedCount = 0;
    for (const mention of mentions) {
      try {
        await mentionQueue.add('process-mention', mention, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        });
        enqueuedCount++;
      } catch (error) {
        console.error(`⚠️ Failed to enqueue mention ${mention.externalId}:`, error);
      }
    }

    console.log(`✅ Enqueued ${enqueuedCount} mentions for processing`);

    // 7️⃣ METTRE À JOUR LA SOURCE
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastScrapedAt: new Date(),
        errorCount: 0,
      },
    });

    return {
      success: true,
      sourceId,
      collectedMentions: mentions.length,
      enqueuedMentions: enqueuedCount,
    };

  } catch (error) {
    console.error(`❌ Scraping failed for source ${sourceId}:`, error);

    // Incrémenter le compteur d'erreurs
    try {
      await prisma.source.update({
        where: { id: sourceId },
        data: {
          errorCount: {
            increment: 1,
          },
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (dbError) {
      console.error('Failed to update source error count:', dbError);
    }

    throw error;
  }
}
