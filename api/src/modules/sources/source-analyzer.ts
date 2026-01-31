/**
 * 🔍 SourceAnalyzer Module
 * 
 * Analyse automatiquement une URL pour déterminer:
 * - SCRAPABLE: Peut être scrappée directement avec Cheerio/Playwright
 * - API_REQUIRED: Nécessite une clé API valide
 * - GOOGLE_SEARCH: Doit passer par Google Search API
 * - UNSUPPORTED: Non supportée ou bloquez
 */

import axios, { AxiosInstance } from 'axios';
import { Logger } from 'winston';
import pRetry from 'p-retry';

/**
 * Types de stratégies de collecte possibles
 */
export enum CollectionStrategy {
  SCRAPABLE = 'SCRAPABLE',
  API_REQUIRED = 'API_REQUIRED',
  GOOGLE_SEARCH = 'GOOGLE_SEARCH',
  UNSUPPORTED = 'UNSUPPORTED'
}

/**
 * Types de blocages détectés
 */
export enum BlockageType {
  CLOUDFLARE = 'CLOUDFLARE',
  RECAPTCHA = 'RECAPTCHA',
  WAF = 'WAF',
  NONE = 'NONE'
}

/**
 * Diagnostic d'une source
 */
export interface SourceDiagnostic {
  url: string;
  strategy: CollectionStrategy;
  status: number | null;
  contentType?: string;
  hasContent: boolean;
  isJavaScriptOnly: boolean;
  blockageType: BlockageType;
  hasRobotsTxt: boolean;
  robotsAllowScraping: boolean;
  estimatedSize: number;
  message: string;
  recommendations: string[];
  logs: DiagnosticLog[];
  timestamp: Date;
}

/**
 * Log structuré pour debugging
 */
export interface DiagnosticLog {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  step: string;
  message: string;
  timestamp: Date;
  duration?: number;
  details?: Record<string, any>;
}

/**
 * Options de configuration pour l'analyseur
 */
export interface SourceAnalyzerOptions {
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
  logger?: Logger;
}

/**
 * Classe SourceAnalyzer - Analyse automatique des sources
 */
export class SourceAnalyzer {
  private axiosInstance: AxiosInstance;
  private timeout: number;
  private maxRetries: number;
  private logs: DiagnosticLog[] = [];
  private logger?: Logger;

  // Internal indicators removed to avoid unused variable TS errors

  private readonly JS_ONLY_INDICATORS = [
    'React',
    'Vue',
    'Angular',
    'Next.js',
    'Nuxt',
    '__NEXT_DATA__'
  ];

  constructor(options: SourceAnalyzerOptions = {}) {
    this.timeout = options.timeout || 10000;
    this.maxRetries = options.maxRetries || 2;
    this.logger = options.logger;

    const userAgent = options.userAgent || 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    this.axiosInstance = axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      validateStatus: () => true // Ne pas lever d'erreur sur status 4xx/5xx
    });
  }

  /**
   * Analyse complète d'une URL
   */
  async analyze(url: string): Promise<SourceDiagnostic> {
    this.logs = [];
    const startTime = Date.now();

    try {
      this.log('INFO', 'INIT', `Analyse de: ${url}`);

      // 1. Validation de l'URL
      if (!this.isValidUrl(url)) {
        return this.createDiagnostic(url, CollectionStrategy.UNSUPPORTED, null, {
          hasContent: false,
          isJavaScriptOnly: false,
          blockageType: BlockageType.NONE,
          hasRobotsTxt: false,
          robotsAllowScraping: false,
          estimatedSize: 0,
          message: 'URL invalide ou malformée',
          recommendations: ["Vérifiez le format de l'URL (http:// ou https://)"]
        });
      }

      // 2. Test de connexion basique
      const statusTest = await this.testConnection(url);
      if (!statusTest.success) {
        return this.createDiagnostic(url, CollectionStrategy.UNSUPPORTED, statusTest.statusCode || null, {
          hasContent: false,
          isJavaScriptOnly: false,
          blockageType: BlockageType.NONE,
          hasRobotsTxt: false,
          robotsAllowScraping: false,
          estimatedSize: 0,
          message: statusTest.message,
          recommendations: statusTest.recommendations
        });
      }

      // 3. Récupération du contenu
      const contentResponse = await this.fetchContent(url);
      if (!contentResponse.success) {
        return this.createDiagnostic(url, CollectionStrategy.UNSUPPORTED, contentResponse.statusCode || null, {
          hasContent: false,
          isJavaScriptOnly: false,
          blockageType: contentResponse.blockageType,
          hasRobotsTxt: false,
          robotsAllowScraping: false,
          estimatedSize: 0,
          message: contentResponse.message,
          recommendations: contentResponse.recommendations
        });
      }

      // 4. Analyse du contenu
      const contentAnalysis = this.analyzeContent(contentResponse.data || '');

      // 5. Vérification de robots.txt
      const robotsCheck = await this.checkRobotsTxt(url);

      // 6. Détermination de la stratégie
      const strategy = this.determineStrategy(
        contentAnalysis,
        robotsCheck,
        contentResponse.blockageType
      );

      const diagnostic = this.createDiagnostic(
        url,
        strategy,
        contentResponse.statusCode || null,
        {
          hasContent: contentAnalysis.hasContent,
          isJavaScriptOnly: contentAnalysis.isJavaScriptOnly,
          blockageType: contentResponse.blockageType,
          hasRobotsTxt: robotsCheck.exists,
          robotsAllowScraping: robotsCheck.allowScrapers,
          estimatedSize: contentResponse.data?.length || 0,
          message: this.generateMessage(strategy, contentAnalysis, contentResponse.blockageType),
          recommendations: this.generateRecommendations(strategy, contentAnalysis),
          contentType: contentResponse.contentType
        }
      );

      const duration = Date.now() - startTime;
      this.log('INFO', 'COMPLETE', `Analyse terminée en ${duration}ms`, { duration });

      return diagnostic;
    } catch (error) {
      this.log('ERROR', 'ANALYZE', `Erreur inattendue: ${error instanceof Error ? error.message : String(error)}`);

      return this.createDiagnostic(url, CollectionStrategy.UNSUPPORTED, null, {
        hasContent: false,
        isJavaScriptOnly: false,
        blockageType: BlockageType.NONE,
        hasRobotsTxt: false,
        robotsAllowScraping: false,
        estimatedSize: 0,
        message: "Erreur lors de l'analyse (problème réseau ou serveur inaccessible)",
        recommendations: ["Vérifiez que l'URL est accessible", 'Réessayez dans quelques secondes']
      });
    }
  }

  /**
   * Valide le format de l'URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Test de connexion basique avec retry
   */
  private async testConnection(
    url: string
  ): Promise<{ success: boolean; statusCode?: number; message: string; recommendations: string[] }> {
    this.log('INFO', 'CONNECTION', `Test de connexion à ${url}`);

    try {
      const response = await pRetry(
        async () => this.axiosInstance.head(url),
        { retries: this.maxRetries }
      ).catch(() => 
        // Si HEAD échoue, essayer GET
        pRetry(
          async () => this.axiosInstance.get(url, { maxContentLength: 1000 }),
          { retries: this.maxRetries }
        )
      );

      const status = response.status;

      if (status === 200 || status === 201) {
        this.log('INFO', 'CONNECTION', `Statut: ${status} OK`);
        return { success: true, statusCode: status, message: 'Connexion établie', recommendations: [] };
      }

      if (status === 401 || status === 403) {
        this.log('WARN', 'CONNECTION', `Statut: ${status} - Accès restreint`);
        return {
          success: false,
          statusCode: status,
          message: 'Accès restreint (401/403)',
          recommendations: ['L\'URL peut nécessiter une authentification', 'Vérifiez les permissions d\'accès']
        };
      }

      if (status === 404) {
        this.log('WARN', 'CONNECTION', `Statut: ${status} - Ressource non trouvée`);
        return {
          success: false,
          statusCode: status,
          message: 'Ressource non trouvée (404)',
          recommendations: ['Vérifiez que l\'URL existe', 'Essayez une URL différente']
        };
      }

      if (status === 429) {
        this.log('WARN', 'CONNECTION', `Statut: ${status} - Rate limit`);
        return {
          success: false,
          statusCode: status,
          message: 'Trop de requêtes (429 Too Many Requests)',
          recommendations: ['Attendez avant de réessayer', 'Considérez l\'utilisation d\'une API']
        };
      }

      if (status >= 500) {
        this.log('WARN', 'CONNECTION', `Statut: ${status} - Erreur serveur`);
        return {
          success: false,
          statusCode: status,
          message: `Erreur serveur (${status})`,
          recommendations: ['Le serveur est peut-être en maintenance', 'Réessayez plus tard']
        };
      }

      // Autres statuts 2xx
      this.log('INFO', 'CONNECTION', `Statut: ${status}`);
      return { success: true, statusCode: status, message: `OK (${status})`, recommendations: [] };
    } catch (error) {
      this.log('ERROR', 'CONNECTION', `Erreur: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        message: 'Impossible de se connecter',
        recommendations: ['Vérifiez que l\'URL est accessible', 'Vérifiez votre connexion réseau']
      };
    }
  }

  /**
   * Récupère le contenu avec détection des blocages
   */
  private async fetchContent(url: string): Promise<{
    success: boolean;
    statusCode?: number;
    data?: string;
    contentType?: string;
    blockageType: BlockageType;
    message: string;
    recommendations: string[];
  }> {
    this.log('INFO', 'FETCH', `Récupération du contenu`);

    try {
      const response = await pRetry(
        async () => this.axiosInstance.get(url, { maxContentLength: 5 * 1024 * 1024 }),
        { retries: this.maxRetries }
      );

      const status = response.status;
      const html = response.data || '';
      const contentType = response.headers['content-type'] || '';

      // Vérifier les blocages
      const blockage = this.detectBlockage(html, response.headers);

      if (blockage !== BlockageType.NONE) {
        this.log('WARN', 'FETCH', `Blocage détecté: ${blockage}`);
        return {
          success: false,
          statusCode: status,
          blockageType: blockage,
          message: `Source bloquée: ${blockage}`,
          recommendations: [`Cette source utilise ${blockage}`, 'Considérez l\'utilisation de Google Search ou d\'une API']
        };
      }

      if (status >= 400) {
        this.log('WARN', 'FETCH', `Statut ${status}`);
        return {
          success: false,
          statusCode: status,
          blockageType: BlockageType.NONE,
          message: `Erreur HTTP ${status}`,
          recommendations: ['Vérifiez que l\'URL est accessible']
        };
      }

      this.log('INFO', 'FETCH', `Contenu reçu: ${html.length} bytes`);
      return {
        success: true,
        statusCode: status,
        data: html,
        contentType,
        blockageType: BlockageType.NONE,
        message: 'Contenu récupéré avec succès',
        recommendations: []
      };
    } catch (error) {
      this.log('ERROR', 'FETCH', `Erreur: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        blockageType: BlockageType.NONE,
        message: 'Impossible de récupérer le contenu',
        recommendations: ['Réessayez plus tard', 'Vérifiez votre connexion']
      };
    }
  }

  /**
   * Détecte les blocages (Cloudflare, reCAPTCHA, WAF)
   */
  private detectBlockage(html: string, headers: Record<string, any>): BlockageType {
    // Vérifier les en-têtes Cloudflare
    if (headers['server']?.includes('cloudflare') || 
        headers['cf-ray'] ||
        html.includes('Cloudflare') ||
        html.includes('cf_clearance')) {
      return BlockageType.CLOUDFLARE;
    }

    // Vérifier reCAPTCHA
    if (html.includes('g-recaptcha') || 
        html.includes('recaptcha') ||
        html.includes('hcaptcha')) {
      return BlockageType.RECAPTCHA;
    }

    // Vérifier WAF générique
    if (html.includes('Web Application Firewall') ||
        html.includes('Access Denied') ||
        html.includes('403 Forbidden')) {
      return BlockageType.WAF;
    }

    return BlockageType.NONE;
  }

  /**
   * Analyse le contenu HTML
   */
  private analyzeContent(html: string): {
    hasContent: boolean;
    isJavaScriptOnly: boolean;
    indicators: string[];
  } {
    this.log('INFO', 'ANALYZE_CONTENT', `Analyse du HTML`);

    // Vérifier s'il y a du contenu (forcer booléen)
    const hasContent = !!html && html.length > 100;

    // Vérifier si JS-only
    const isJavaScriptOnly = this.JS_ONLY_INDICATORS.some(indicator => html.includes(indicator));

    // Extraire les indicateurs détectés
    const indicators: string[] = [];
    if (html.includes('__NEXT_DATA__')) indicators.push('Next.js');
    if (html.includes('__NUXT__')) indicators.push('Nuxt');
    if (html.includes('ng-app') || html.includes('ng-controller')) indicators.push('Angular');
    if (html.includes('data-v-app')) indicators.push('Vue');
    if (html.includes('React')) indicators.push('React');

    this.log('DEBUG', 'ANALYZE_CONTENT', `Résultat: hasContent=${hasContent}, isJavaScriptOnly=${isJavaScriptOnly}`, {
      indicators
    });

    return { hasContent, isJavaScriptOnly, indicators };
  }

  /**
   * Vérifie robots.txt
   */
  private async checkRobotsTxt(url: string): Promise<{
    exists: boolean;
    allowScrapers: boolean;
  }> {
    this.log('INFO', 'ROBOTS', `Vérification de robots.txt`);

    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`;

      const response = await this.axiosInstance.get(robotsUrl, { timeout: 5000 });

      if (response.status === 200) {
        const robotsContent = response.data || '';
        
        // Vérifier s'il y a un "Disallow: /" généralisé
        const hasGeneralDisallow = /Disallow:\s*\/\s*$/m.test(robotsContent);
        const hasUserAgentWildcard = /User-agent:\s*\*/i.test(robotsContent);

        const allowScrapers = !(hasGeneralDisallow && hasUserAgentWildcard);

        this.log('INFO', 'ROBOTS', `robots.txt trouvé, allowScrapers=${allowScrapers}`);
        return { exists: true, allowScrapers };
      }

      this.log('INFO', 'ROBOTS', `robots.txt non trouvé (${response.status})`);
      return { exists: false, allowScrapers: true };
    } catch (error) {
      this.log('WARN', 'ROBOTS', `Erreur lors de la vérification de robots.txt`);
      return { exists: false, allowScrapers: true };
    }
  }

  /**
   * Détermine la stratégie de collecte
   */
  private determineStrategy(
    contentAnalysis: { hasContent: boolean; isJavaScriptOnly: boolean; indicators: string[] },
    robotsCheck: { exists: boolean; allowScrapers: boolean },
    blockageType: BlockageType
  ): CollectionStrategy {
    this.log('INFO', 'STRATEGY', `Détermination de la stratégie`);

    // Si bloqué
    if (blockageType !== BlockageType.NONE) {
      this.log('INFO', 'STRATEGY', `Stratégie: GOOGLE_SEARCH (blocage ${blockageType})`);
      return CollectionStrategy.GOOGLE_SEARCH;
    }

    // Si robots.txt interdit
    if (!robotsCheck.allowScrapers) {
      this.log('INFO', 'STRATEGY', `Stratégie: GOOGLE_SEARCH (robots.txt refuse)`);
      return CollectionStrategy.GOOGLE_SEARCH;
    }

    // Si pas de contenu
    if (!contentAnalysis.hasContent) {
      this.log('INFO', 'STRATEGY', `Stratégie: UNSUPPORTED (pas de contenu)`);
      return CollectionStrategy.UNSUPPORTED;
    }

    // Si JS-only
    if (contentAnalysis.isJavaScriptOnly) {
      this.log('INFO', 'STRATEGY', `Stratégie: GOOGLE_SEARCH (JS-only)`);
      return CollectionStrategy.GOOGLE_SEARCH;
    }

    // Scrappable par défaut
    this.log('INFO', 'STRATEGY', `Stratégie: SCRAPABLE`);
    return CollectionStrategy.SCRAPABLE;
  }

  /**
   * Génère le message pour l'utilisateur
   */
  private generateMessage(
    strategy: CollectionStrategy,
    contentAnalysis: { hasContent: boolean; isJavaScriptOnly: boolean; indicators: string[] },
    blockageType: BlockageType
  ): string {
    switch (strategy) {
      case CollectionStrategy.SCRAPABLE:
        return 'Cette source peut être scrappée directement. Les mentions seront collectées via Cheerio/Playwright.';
      
      case CollectionStrategy.GOOGLE_SEARCH:
        const reason = blockageType !== BlockageType.NONE
          ? `la source utilise ${blockageType}`
          : contentAnalysis.isJavaScriptOnly
            ? 'la source est entièrement en JavaScript'
            : 'robots.txt refuse le scraping';
        return `Cette source nécessite Google Search API car ${reason}. Les mentions seront recherchées via Google.`;
      
      case CollectionStrategy.API_REQUIRED:
        return 'Cette source nécessite une clé API valide pour accéder aux données.';
      
      case CollectionStrategy.UNSUPPORTED:
        return 'Cette source n\'est pas supportée ou n\'est pas accessible.';
      
      default:
        return 'Type de source inconnu.';
    }
  }

  /**
   * Génère les recommandations
   */
  private generateRecommendations(
    strategy: CollectionStrategy,
    contentAnalysis: { hasContent: boolean; isJavaScriptOnly: boolean; indicators: string[] }
  ): string[] {
    const recommendations: string[] = [];

    switch (strategy) {
      case CollectionStrategy.SCRAPABLE:
        recommendations.push('La source sera scrappée toutes les 6 heures par défaut');
        recommendations.push('Vous pouvez ajuster la fréquence de scraping dans les paramètres');
        break;
      
      case CollectionStrategy.GOOGLE_SEARCH:
        recommendations.push('Assurez-vous que Google Search API est configurée');
        recommendations.push('Vous pouvez définir des mots-clés spécifiques pour améliorer les résultats');
        recommendations.push('La fréquence de mise à jour dépend des limites de l\'API');
        break;
      
      case CollectionStrategy.API_REQUIRED:
        recommendations.push('Fournissez une clé API valide pour cette plateforme');
        recommendations.push('Vérifiez que la clé a les permissions d\'accès appropriées');
        break;
      
      case CollectionStrategy.UNSUPPORTED:
        if (!contentAnalysis.hasContent) {
          recommendations.push('La page semble vide ou inaccessible');
        }
        recommendations.push('Vérifiez que l\'URL est correcte et accessible');
        recommendations.push('Essayez une plateforme supportée (Twitter, Reddit, Trustpilot, etc.)');
        break;
    }

    return recommendations;
  }

  /**
   * Enregistre un log
   */
  private log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', step: string, message: string, details?: Record<string, any>): void {
    const logEntry: DiagnosticLog = {
      level,
      step,
      message,
      timestamp: new Date(),
      details
    };

    this.logs.push(logEntry);

    if (this.logger) {
      this.logger.log(level.toLowerCase(), message, { step, ...details });
    }
  }

  /**
   * Crée un objet SourceDiagnostic
   */
  private createDiagnostic(
    url: string,
    strategy: CollectionStrategy,
    status: number | null,
    additionalData: {
      hasContent: boolean;
      isJavaScriptOnly: boolean;
      blockageType: BlockageType;
      hasRobotsTxt: boolean;
      robotsAllowScraping: boolean;
      estimatedSize: number;
      message: string;
      recommendations: string[];
      contentType?: string;
    }
  ): SourceDiagnostic {
    return {
      url,
      strategy,
      status,
      contentType: additionalData.contentType,
      hasContent: additionalData.hasContent,
      isJavaScriptOnly: additionalData.isJavaScriptOnly,
      blockageType: additionalData.blockageType,
      hasRobotsTxt: additionalData.hasRobotsTxt,
      robotsAllowScraping: additionalData.robotsAllowScraping,
      estimatedSize: additionalData.estimatedSize,
      message: additionalData.message,
      recommendations: additionalData.recommendations,
      logs: this.logs,
      timestamp: new Date()
    };
  }
}

export default SourceAnalyzer;
