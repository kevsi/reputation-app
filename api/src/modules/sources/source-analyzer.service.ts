/**
 * 🔍 SourceAnalyzer Service
 * 
 * Service intégrant SourceAnalyzer avec l'architecture existante
 */

import { Logger } from 'winston';
import SourceAnalyzer, { 
  SourceDiagnostic, 
  CollectionStrategy,
  BlockageType 
} from './source-analyzer';
import { PrismaClient, Source } from '@sentinelle/database';

/**
 * Options pour l'analyse
 */
export interface AnalysisOptions {
  timeout?: number;
  maxRetries?: number;
}

/**
 * Résultat de l'analyse avec actions recommandées
 */
export interface AnalysisResult {
  diagnostic: SourceDiagnostic;
  suggestedSourceType?: string;
  suggestedConfig?: Record<string, any>;
  requiresUserAction: boolean;
  actionDescription?: string;
}

/**
 * Service d'analyse des sources
 */
export class SourceAnalyzerService {
  private analyzer: SourceAnalyzer;
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient, logger: Logger) {
    this.prisma = prisma;
    this.logger = logger;
    this.analyzer = new SourceAnalyzer({
      timeout: 10000,
      maxRetries: 2,
      logger
    });
  }

  /**
   * Analyse une URL et retourne les résultats avec actions recommandées
   */
  async analyzeUrl(url: string, options?: AnalysisOptions): Promise<AnalysisResult> {
    this.logger.info(`[SourceAnalyzerService] Analyse de: ${url}`, { options });

    try {
      const diagnostic = await this.analyzer.analyze(url);

      const result: AnalysisResult = {
        diagnostic,
        requiresUserAction: this.determineRequiresUserAction(diagnostic)
      };

      // Ajouter des suggestions basées sur la stratégie
      if (diagnostic.strategy === CollectionStrategy.SCRAPABLE) {
        result.suggestedSourceType = 'WEB';
        result.suggestedConfig = {
          url: diagnostic.url,
          scrapingFrequency: 21600, // 6 heures en secondes
          method: 'cheerio'
        };
        result.actionDescription = 'Vous pouvez créer une source web pour scraper automatiquement cette URL.';
      } else if (diagnostic.strategy === CollectionStrategy.GOOGLE_SEARCH) {
        result.suggestedSourceType = 'SEARCH';
        result.suggestedConfig = {
          url: diagnostic.url,
          searchEngine: 'google',
          scrapingFrequency: 86400 // 24 heures
        };
        result.actionDescription = 'Utilisez Google Search API pour récupérer les mentions. Assurez-vous que l\'API est configurée.';
      } else if (diagnostic.strategy === CollectionStrategy.API_REQUIRED) {
        result.requiresUserAction = true;
        result.actionDescription = 'Vous devez fournir une clé API valide pour cette source.';
      } else if (diagnostic.strategy === CollectionStrategy.UNSUPPORTED) {
        result.requiresUserAction = true;
        result.actionDescription = 'Cette source n\'est pas supportée. Essayez une autre URL ou une plateforme supportée.';
      }

      this.logger.info(`[SourceAnalyzerService] Résultat: ${diagnostic.strategy}`, {
        url,
        strategy: diagnostic.strategy,
        blockage: diagnostic.blockageType
      });

      return result;
    } catch (error) {
      this.logger.error(`[SourceAnalyzerService] Erreur lors de l'analyse`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * Analyse un batch d'URLs
   */
  async analyzeBatch(urls: string[]): Promise<AnalysisResult[]> {
    this.logger.info(`[SourceAnalyzerService] Analyse d'un batch de ${urls.length} URLs`);

    const results = await Promise.all(
      urls.map(url => this.analyzeUrl(url).catch(error => ({
        diagnostic: {
          url,
          strategy: CollectionStrategy.UNSUPPORTED,
          status: null,
          hasContent: false,
          isJavaScriptOnly: false,
          blockageType: BlockageType.NONE,
          hasRobotsTxt: false,
          robotsAllowScraping: false,
          estimatedSize: 0,
          message: `Erreur lors de l'analyse: ${error instanceof Error ? error.message : String(error)}`,
          recommendations: ['Réessayez plus tard'],
          logs: [],
          timestamp: new Date()
        } as SourceDiagnostic,
        requiresUserAction: true
      })))
    );

    return results;
  }

  /**
   * Détermine si une action utilisateur est requise
   */
  private determineRequiresUserAction(diagnostic: SourceDiagnostic): boolean {
    return diagnostic.strategy === CollectionStrategy.API_REQUIRED ||
           diagnostic.strategy === CollectionStrategy.UNSUPPORTED;
  }

  /**
   * Exporte les logs en JSON
   */
  exportLogsJson(diagnostic: SourceDiagnostic): string {
    return JSON.stringify(diagnostic.logs, null, 2);
  }

  /**
   * Crée une source dans la BD basée sur le diagnostic
   */
  async createSourceFromDiagnostic(
    diagnostic: SourceDiagnostic,
    brandId: string,
    name?: string
  ): Promise<Source | null> {
    // Vérifier que la stratégie est supportée
    if (diagnostic.strategy === CollectionStrategy.UNSUPPORTED) {
      this.logger.warn(`[SourceAnalyzerService] Impossible de créer une source UNSUPPORTED`);
      return null;
    }

    try {
      const sourceConfig: Record<string, any> = {
        url: diagnostic.url
      };

      // Ajouter les métadonnées du diagnostic
      sourceConfig.analysisMeta = {
        contentType: diagnostic.contentType,
        estimatedSize: diagnostic.estimatedSize,
        blockageDetected: diagnostic.blockageType,
        isJavaScriptOnly: diagnostic.isJavaScriptOnly,
        analyzedAt: diagnostic.timestamp.toISOString()
      };

      const sourceType = this.mapStrategyToSourceType(diagnostic.strategy);

      const source = await this.prisma.source.create({
        data: {
          name: name || `Source - ${diagnostic.url.split('/')[2]}`,
          type: sourceType as any,
          url: diagnostic.url,
          brandId,
          config: sourceConfig,
          scrapingFrequency: 21600, // Valeur par défaut en secondes
          isActive: true
        }
      });

      this.logger.info(`[SourceAnalyzerService] Source créée avec succès`, {
        sourceId: source.id,
        type: sourceType,
        url: diagnostic.url
      });

      return source;
    } catch (error) {
      this.logger.error(`[SourceAnalyzerService] Erreur lors de la création de la source`, {
        url: diagnostic.url,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Mappe une stratégie de collecte à un type de source
   */
  private mapStrategyToSourceType(strategy: CollectionStrategy): string {
    switch (strategy) {
      case CollectionStrategy.SCRAPABLE:
        return 'BLOG'; // Type web scrapable par défaut
      case CollectionStrategy.GOOGLE_SEARCH:
        return 'NEWS'; // Utilise Google Search
      case CollectionStrategy.API_REQUIRED:
        return 'API'; // Source basée sur API
      default:
        return 'BLOG';
    }
  }
}

export default SourceAnalyzerService;
