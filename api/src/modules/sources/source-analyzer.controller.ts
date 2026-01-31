/**
 * 🔍 SourceAnalyzer Controller
 * 
 * Endpoints pour l'analyse des sources
 */

import { Request, Response } from 'express';
import { Logger } from 'winston';
import SourceAnalyzerService from './source-analyzer.service';
import { AppError } from '@/infrastructure/errors/app-error';
import { PrismaClient } from '@sentinelle/database';

/**
 * Contrôleur pour l'analyse des sources
 */
export class SourceAnalyzerController {
  private service: SourceAnalyzerService;
  private logger: Logger;

  constructor(prisma: PrismaClient, logger: Logger) {
    this.logger = logger;
    this.service = new SourceAnalyzerService(prisma, logger);
  }

  /**
   * POST /api/sources/analyze
   * 
   * Analyse une URL unique
   * 
   * Body:
   * {
   *   "url": "https://example.com",
   *   "includeDebugLogs": false (optionnel)
   * }
   */
  async analyzeUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url, includeDebugLogs = false } = req.body;

      if (!url) {
        throw new AppError('URL est requise', 400);
      }

      if (typeof url !== 'string') {
        throw new AppError('URL doit être une chaîne de caractères', 400);
      }

      this.logger.info(`[SourceAnalyzerController] Analyse de: ${url}`);

      const result = await this.service.analyzeUrl(url);

      // Filtrer les logs de debug si demandé
      if (!includeDebugLogs) {
        result.diagnostic.logs = result.diagnostic.logs.filter(
          log => log.level !== 'DEBUG'
        );
      }

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error(`[SourceAnalyzerController] Erreur lors de l'analyse`, {
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  }

  /**
   * POST /api/sources/analyze/batch
   * 
   * Analyse plusieurs URLs
   * 
   * Body:
   * {
   *   "urls": ["https://example1.com", "https://example2.com"],
   *   "parallel": true (optionnel)
   * }
   */
  async analyzeBatch(req: Request, res: Response): Promise<void> {
    try {
      const { urls } = req.body;

      if (!Array.isArray(urls)) {
        throw new AppError('URLs doit être un tableau', 400);
      }

      if (urls.length === 0) {
        throw new AppError('Au moins une URL est requise', 400);
      }

      if (urls.length > 50) {
        throw new AppError('Limite de 50 URLs par batch', 400);
      }

      this.logger.info(`[SourceAnalyzerController] Analyse de batch de ${urls.length} URLs`);

      const results = await this.service.analyzeBatch(urls);

      res.status(200).json({
        success: true,
        data: {
          total: urls.length,
          results
        },
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error(`[SourceAnalyzerController] Erreur lors de l'analyse batch`, {
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  }

  /**
   * POST /api/sources/analyze-and-create
   * 
   * Analyse une URL et crée automatiquement une source si possible
   * 
   * Body:
   * {
   *   "url": "https://example.com",
   *   "brandId": "uuid",
   *   "name": "Ma Source" (optionnel),
   *   "organizationId": "uuid" (optionnel, défaut de req.user.organizations[0])
   * }
   * 
   * Réponse:
   * {
   *   "analysis": {...},
   *   "source": {...} ou null,
   *   "created": boolean
   * }
   */
  async analyzeAndCreate(req: Request, res: Response): Promise<void> {
    try {
      const { url, brandId, name } = req.body;

      if (!url) {
        throw new AppError('URL est requise', 400);
      }

      if (!brandId) {
        throw new AppError('brandId est requis', 400);
      }

      this.logger.info(`[SourceAnalyzerController] Analyse et création pour: ${url}`);

      const result = await this.service.analyzeUrl(url);

      let source = null;
      let created = false;

      if (result.diagnostic.strategy !== 'UNSUPPORTED' && result.diagnostic.strategy !== 'API_REQUIRED') {
        source = await this.service.createSourceFromDiagnostic(
          result.diagnostic,
          brandId,
          name
        );

        created = source !== null;
      }

      res.status(201).json({
        success: true,
        data: {
          analysis: result,
          source,
          created
        },
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error(`[SourceAnalyzerController] Erreur lors de l'analyse et création`, {
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  }

  /**
   * GET /api/sources/analyze-docs
   * 
   * Retourne la documentation de l'endpoint d'analyse
   */
  async getDocs(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      name: 'SourceAnalyzer API',
      version: '1.0.0',
      description: 'Service d\'analyse automatique d\'URLs pour déterminer la stratégie de collecte optimale',
      endpoints: [
        {
          method: 'POST',
          path: '/api/sources/analyze',
          description: 'Analyse une URL unique',
          body: {
            url: 'string (required)',
            includeDebugLogs: 'boolean (optional, default: false)'
          },
          response: {
            diagnostic: {
              url: 'string',
              strategy: 'SCRAPABLE | API_REQUIRED | GOOGLE_SEARCH | UNSUPPORTED',
              status: 'number | null',
              contentType: 'string',
              hasContent: 'boolean',
              isJavaScriptOnly: 'boolean',
              blockageType: 'CLOUDFLARE | RECAPTCHA | WAF | NONE',
              hasRobotsTxt: 'boolean',
              robotsAllowScraping: 'boolean',
              estimatedSize: 'number',
              message: 'string',
              recommendations: 'string[]',
              logs: 'DiagnosticLog[]',
              timestamp: 'Date'
            },
            suggestedSourceType: 'string',
            suggestedConfig: 'Record<string, any>',
            requiresUserAction: 'boolean',
            actionDescription: 'string'
          }
        },
        {
          method: 'POST',
          path: '/api/sources/analyze/batch',
          description: 'Analyse plusieurs URLs',
          body: {
            urls: 'string[] (required)',
            parallel: 'boolean (optional, default: true)'
          },
          response: {
            total: 'number',
            results: 'AnalysisResult[]'
          }
        },
        {
          method: 'POST',
          path: '/api/sources/analyze-and-create',
          description: 'Analyse une URL et crée automatiquement une source',
          body: {
            url: 'string (required)',
            brandId: 'string (required)',
            name: 'string (optional)',
            organizationId: 'string (optional)'
          },
          response: {
            analysis: 'AnalysisResult',
            source: 'Source | null',
            created: 'boolean'
          }
        }
      ],
      strategies: {
        SCRAPABLE: 'L\'URL peut être scrappée directement avec Cheerio/Playwright',
        API_REQUIRED: 'L\'URL nécessite une clé API valide',
        GOOGLE_SEARCH: 'L\'URL doit passer par Google Search API (bloquée, JS-only, etc.)',
        UNSUPPORTED: 'L\'URL n\'est pas supportée ou inaccessible'
      },
      blockageTypes: {
        CLOUDFLARE: 'Cloudflare DDoS Protection',
        RECAPTCHA: 'Google reCAPTCHA ou hCaptcha',
        WAF: 'Web Application Firewall',
        NONE: 'Pas de blocage détecté'
      }
    });
  }
}

export default SourceAnalyzerController;
