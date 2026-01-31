/**
 * 🔗 Intégration SourceAnalyzer avec les Workers
 * 
 * Comment utiliser SourceAnalyzer dans les processors existants
 */

// ============================================================================
// EXEMPLE 1: Améliorer scraping.processor.ts
// ============================================================================

/**
 * Fichier: workers/src/processors/scraping.processor.ts
 * 
 * Utiliser les métadonnées d'analyse pour adapter la stratégie
 */

import { Job } from 'bullmq';
import { Source } from '@sentinelle/database';
import * as cheerio from 'cheerio';
import { PlaywrightCollector } from '../collectors/playwright.collector';
import { WebCollector } from '../collectors/web.collector';
import logger from '@/infrastructure/logging';

/**
 * Amélioré avec support SourceAnalyzer
 */
export class ScrapingProcessor {
  async process(job: Job): Promise<void> {
    const source = job.data as Source;
    
    logger.info(`[ScrapingProcessor] Processing source ${source.id}`, {
      type: source.type,
      url: source.config?.url
    });

    try {
      // 🆕 NOUVEAU: Récupérer les métadonnées d'analyse
      const analysisMeta = source.config?.analysisMeta as any || {};
      
      // Déterminer le collector basé sur l'analyse
      let collector;
      
      if (analysisMeta.isJavaScriptOnly) {
        // JavaScript-only → utiliser Playwright (plus lent mais plus capable)
        logger.info(`[ScrapingProcessor] Site JS-only détecté, utilisant Playwright`);
        collector = new PlaywrightCollector();
      } else if (analysisMeta.blockageDetected && analysisMeta.blockageDetected !== 'NONE') {
        // Bloqué → utiliser Playwright pour contourner (si disponible)
        logger.warn(`[ScrapingProcessor] Blocage ${analysisMeta.blockageDetected} détecté, tentative avec Playwright`);
        collector = new PlaywrightCollector();
      } else {
        // Scrappable → utiliser Cheerio (plus rapide)
        logger.info(`[ScrapingProcessor] Site scrappable, utilisant Cheerio`);
        collector = new WebCollector();
      }

      // ... reste du traitement
      const keywords = source.brand.keywords || [source.brand.name];
      const mentions = await collector.collect(source, keywords);

      logger.info(`[ScrapingProcessor] ${mentions.length} mentions collectées`);

      // ... persistance, etc.
    } catch (error) {
      logger.error(`[ScrapingProcessor] Erreur:`, {
        sourceId: source.id,
        error: error instanceof Error ? error.message : String(error)
      });

      // 🆕 NOUVEAU: Enregistrer l'erreur avec contexte
      if (source.config?.analysisMeta) {
        logger.error(`[ScrapingProcessor] Contexte d'analyse:`, {
          blockage: source.config.analysisMeta.blockageDetected,
          jsOnly: source.config.analysisMeta.isJavaScriptOnly
        });
      }

      throw error;
    }
  }
}

// ============================================================================
// EXEMPLE 2: Créer un Source après SourceAnalyzer
// ============================================================================

/**
 * Workflow: Utilisateur soumet URL → SourceAnalyzer → Source créée → Worker traite
 */

import { PrismaClient, Source, SentimentType } from '@sentinelle/database';
import SourceAnalyzerService from '@/modules/sources/source-analyzer.service';

export async function createSourceFromUserInput(
  url: string,
  brandId: string,
  organizationId: string,
  userLogger: any
): Promise<Source | null> {
  const prisma = new PrismaClient();
  
  try {
    // 1. Analyser l'URL
    const analyzerService = new SourceAnalyzerService(prisma, userLogger);
    const result = await analyzerService.analyzeUrl(url);

    logger.info(`[CreateSource] Analyse complétée: ${result.diagnostic.strategy}`);

    // 2. Déterminer le type de source et la config
    let sourceType = 'BLOG'; // défaut
    let scrapingFrequency = 21600; // 6 heures par défaut

    if (result.diagnostic.strategy === 'SCRAPABLE') {
      sourceType = 'BLOG'; // ou FORUM, NEWS selon le contenu
      scrapingFrequency = 21600; // 6 heures
    } else if (result.diagnostic.strategy === 'GOOGLE_SEARCH') {
      sourceType = 'NEWS'; // Utiliser Google Search
      scrapingFrequency = 86400; // 24 heures (limites API)
    } else if (result.diagnostic.strategy === 'API_REQUIRED') {
      // Demander la clé API à l'utilisateur
      logger.warn(`[CreateSource] API requise pour ${url}`);
      return null;
    } else {
      // UNSUPPORTED
      logger.error(`[CreateSource] Source non supportée: ${url}`);
      return null;
    }

    // 3. Créer la source avec les métadonnées
    const source = await prisma.source.create({
      data: {
        name: url.split('/')[2], // hostname
        type: sourceType,
        url: url,
        brandId: brandId,
        organizationId: organizationId,
        scrapingFrequency: scrapingFrequency,
        isActive: true,
        config: {
          url: url,
          analysisMeta: {
            strategy: result.diagnostic.strategy,
            blockageDetected: result.diagnostic.blockageType,
            isJavaScriptOnly: result.diagnostic.isJavaScriptOnly,
            hasContent: result.diagnostic.hasContent,
            robotsAllowScraping: result.diagnostic.robotsAllowScraping,
            estimatedSize: result.diagnostic.estimatedSize,
            contentType: result.diagnostic.contentType,
            analyzedAt: result.diagnostic.timestamp.toISOString()
          }
        }
      }
    });

    logger.info(`[CreateSource] Source créée: ${source.id}`, {
      type: sourceType,
      frequency: scrapingFrequency,
      strategy: result.diagnostic.strategy
    });

    return source;
  } catch (error) {
    logger.error(`[CreateSource] Erreur:`, error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// EXEMPLE 3: Monitoring des sources basé sur l'analyse
// ============================================================================

/**
 * Monitorer les sources avec des alertes basées sur les métadonnées d'analyse
 */

export async function monitorSources(prisma: PrismaClient): Promise<void> {
  try {
    const sources = await prisma.source.findMany({
      include: { brand: true }
    });

    for (const source of sources) {
      const meta = source.config?.analysisMeta as any || {};
      
      // Alerte 1: Source JS-only sans Playwright
      if (meta.isJavaScriptOnly && !source.config?.usePlaywright) {
        logger.warn(`[Monitor] Source JS-only sans Playwright: ${source.id}`);
        // → Notifier l'admin de mettre à jour
      }

      // Alerte 2: Blocage détecté mais pas Google Search
      if (meta.blockageDetected !== 'NONE' && source.type !== 'NEWS') {
        logger.warn(`[Monitor] Blocage ${meta.blockageDetected} sur source ${source.id}`);
        // → Suggérer d'utiliser Google Search API
      }

      // Alerte 3: robots.txt refuse mais source scrappable
      if (!meta.robotsAllowScraping && source.type === 'BLOG') {
        logger.warn(`[Monitor] robots.txt refuse mais source scrappable: ${source.id}`);
        // → Vérifier la légalité
      }

      // Alerte 4: Pas de contenu (source morte?)
      if (!meta.hasContent) {
        logger.error(`[Monitor] Pas de contenu détecté: ${source.id}`);
        // → Marquer comme inactive
      }
    }
  } catch (error) {
    logger.error(`[Monitor] Erreur:`, error);
  }
}

// ============================================================================
// EXEMPLE 4: Adaptive Retry Strategy
// ============================================================================

/**
 * Adapter la stratégie de retry selon la raison de l'erreur
 */

export async function smartRetry(
  source: Source,
  error: Error
): Promise<{ shouldRetry: boolean; delay: number; reason: string }> {
  const meta = source.config?.analysisMeta as any || {};
  
  const errorMsg = error.message.toLowerCase();

  // Si Cloudflare/WAF → pas de retry (impossible sans contournement)
  if (meta.blockageDetected === 'CLOUDFLARE' || meta.blockageDetected === 'WAF') {
    return {
      shouldRetry: false,
      delay: 0,
      reason: 'Blocage détecté, impossible de retry sans contournement'
    };
  }

  // Si timeout → retry après délai
  if (errorMsg.includes('timeout') || errorMsg.includes('econnrefused')) {
    return {
      shouldRetry: true,
      delay: 60000, // 1 minute
      reason: 'Timeout réseau, retry après 1 minute'
    };
  }

  // Si 429 (rate limit) → retry après plus long délai
  if (errorMsg.includes('429') || errorMsg.includes('too many requests')) {
    return {
      shouldRetry: true,
      delay: 3600000, // 1 heure
      reason: 'Rate limit, retry après 1 heure'
    };
  }

  // Si 503 (service indisponible) → retry rapidement
  if (errorMsg.includes('503') || errorMsg.includes('unavailable')) {
    return {
      shouldRetry: true,
      delay: 300000, // 5 minutes
      reason: 'Service indisponible, retry après 5 minutes'
    };
  }

  // Autres erreurs → pas de retry
  return {
    shouldRetry: false,
    delay: 0,
    reason: 'Erreur non récupérable'
  };
}

// ============================================================================
// EXEMPLE 5: Utiliser Google Search API comme fallback
// ============================================================================

/**
 * Si le scraping échoue → utiliser Google Search API comme fallback
 */

import GoogleSearchCollector from '../collectors/google-search.collector';

export async function fallbackToGoogleSearch(
  source: Source,
  keywords: string[],
  error: Error
): Promise<any[]> {
  const meta = source.config?.analysisMeta as any || {};

  // Vérifier si fallback est approprié
  if (
    error.message.includes('Cloudflare') ||
    error.message.includes('reCAPTCHA') ||
    error.message.includes('403') ||
    meta.blockageDetected !== 'NONE'
  ) {
    logger.info(`[Fallback] Utiliser Google Search API pour ${source.id}`);
    
    const googleCollector = new GoogleSearchCollector();
    try {
      const mentions = await googleCollector.collect(source, keywords);
      logger.info(`[Fallback] ${mentions.length} mentions via Google Search`);
      return mentions;
    } catch (fallbackError) {
      logger.error(`[Fallback] Google Search aussi échoué:`, fallbackError);
      return [];
    }
  }

  // Sinon, laisser l'erreur remonter
  throw error;
}

// ============================================================================
// EXEMPLE 6: Dashboard de statistiques
// ============================================================================

/**
 * Générer des stats basées sur les métadonnées d'analyse
 */

export async function getSourceStatistics(prisma: PrismaClient): Promise<any> {
  const sources = await prisma.source.findMany({
    include: { brand: true }
  });

  const stats = {
    total: sources.length,
    byStrategy: {
      scrapable: 0,
      googleSearch: 0,
      apiRequired: 0,
      unsupported: 0
    },
    byBlockage: {
      cloudflare: 0,
      recaptcha: 0,
      waf: 0,
      none: 0
    },
    jsOnlyCount: 0,
    robotsRestrictiveCount: 0,
    avgEstimatedSize: 0,
    issues: [] as string[]
  };

  let totalSize = 0;

  for (const source of sources) {
    const meta = source.config?.analysisMeta as any || {};

    // Compter par stratégie
    const strategy = meta.strategy?.toLowerCase() || 'unknown';
    if (stats.byStrategy[strategy as any]) {
      stats.byStrategy[strategy as any]++;
    }

    // Compter par blocage
    const blockage = meta.blockageDetected?.toLowerCase() || 'none';
    if (stats.byBlockage[blockage as any]) {
      stats.byBlockage[blockage as any]++;
    }

    // JS-only
    if (meta.isJavaScriptOnly) {
      stats.jsOnlyCount++;
    }

    // robots.txt restrictif
    if (!meta.robotsAllowScraping) {
      stats.robotsRestrictiveCount++;
    }

    // Taille estimée
    totalSize += meta.estimatedSize || 0;

    // Issues
    if (!meta.hasContent) {
      stats.issues.push(`Source morte: ${source.id}`);
    }
    if (meta.blockageDetected !== 'NONE' && source.type !== 'NEWS') {
      stats.issues.push(`Blocage non géré: ${source.id} (${meta.blockageDetected})`);
    }
  }

  stats.avgEstimatedSize = Math.round(totalSize / sources.length);

  return stats;
}

/**
 * Résultat exemple:
 * {
 *   "total": 12,
 *   "byStrategy": {
 *     "scrapable": 7,
 *     "googleSearch": 3,
 *     "apiRequired": 1,
 *     "unsupported": 1
 *   },
 *   "byBlockage": {
 *     "cloudflare": 2,
 *     "recaptcha": 1,
 *     "waf": 0,
 *     "none": 9
 *   },
 *   "jsOnlyCount": 3,
 *   "robotsRestrictiveCount": 2,
 *   "avgEstimatedSize": 45234,
 *   "issues": [
 *     "Source morte: source-xyz",
 *     "Blocage non géré: source-abc (CLOUDFLARE)"
 *   ]
 * }
 */

export {};
