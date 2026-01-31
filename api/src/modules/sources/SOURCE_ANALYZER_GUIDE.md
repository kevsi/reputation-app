/**
 * 📚 SourceAnalyzer - Documentation & Exemples d'Utilisation
 * 
 * Guide complet du module d'analyse des sources
 */

// ============================================================================
// 1. INSTALLATION & CONFIGURATION
// ============================================================================

/**
 * Installation des dépendances requises:
 * 
 * npm install axios p-retry
 */

// ============================================================================
// 2. INTÉGRATION AVEC EXPRESS
// ============================================================================

/**
 * Exemple d'intégration dans src/modules/sources/index.ts:
 * 
 * import { Router } from 'express';
 * import { PrismaClient } from '@sentinelle/database';
 * import { Logger } from 'winston';
 * import createSourceAnalyzerRoutes from './source-analyzer.routes';
 * 
 * export function createSourceRoutes(
 *   prisma: PrismaClient,
 *   logger: Logger
 * ): Router {
 *   const router = Router();
 *   
 *   // Inclure les routes d'analyse
 *   router.use('/analyze', createSourceAnalyzerRoutes(prisma, logger));
 *   
 *   // Autres routes de sources...
 *   
 *   return router;
 * }
 */

// ============================================================================
// 3. UTILISATION DIRECTE DU MODULE
// ============================================================================

/**
 * Exemple 1: Analyse simple d'une URL
 * 
 * import SourceAnalyzer from './source-analyzer';
 * 
 * async function example1() {
 *   const analyzer = new SourceAnalyzer({
 *     timeout: 10000,
 *     maxRetries: 2
 *   });
 * 
 *   const diagnostic = await analyzer.analyze('https://news.example.com');
 * 
 *   console.log('Stratégie:', diagnostic.strategy);
 *   console.log('Message:', diagnostic.message);
 *   console.log('Recommandations:', diagnostic.recommendations);
 * 
 *   // Accéder aux logs pour debugging
 *   console.log('Logs:', diagnostic.logs);
 * }
 */

// ============================================================================
// 4. UTILISATION VIA LE SERVICE
// ============================================================================

/**
 * Exemple 2: Utiliser le service avec Prisma
 * 
 * import { PrismaClient } from '@sentinelle/database';
 * import { createLogger } from 'winston';
 * import SourceAnalyzerService from './source-analyzer.service';
 * 
 * async function example2() {
 *   const prisma = new PrismaClient();
 *   const logger = createLogger({...});
 * 
 *   const service = new SourceAnalyzerService(prisma, logger);
 * 
 *   // Analyser une URL
 *   const result = await service.analyzeUrl('https://example.com/blog');
 * 
 *   console.log('Stratégie détectée:', result.diagnostic.strategy);
 *   console.log('Type de source suggéré:', result.suggestedSourceType);
 *   console.log('Config suggérée:', result.suggestedConfig);
 * 
 *   // Analyser et créer automatiquement une source
 *   if (!result.requiresUserAction) {
 *     const source = await service.createSourceFromDiagnostic(
 *       result.diagnostic,
 *       brandId,
 *       organizationId,
 *       'Mon blog'
 *     );
 *     console.log('Source créée:', source?.id);
 *   }
 * }
 */

// ============================================================================
// 5. APPELS API HTTP
// ============================================================================

/**
 * Exemple 3: Analyser une URL via HTTP (curl)
 * 
 * curl -X POST http://localhost:5001/api/sources/analyze \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "url": "https://techblog.example.com",
 *     "includeDebugLogs": false
 *   }'
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": {
 *     "diagnostic": {
 *       "url": "https://techblog.example.com",
 *       "strategy": "SCRAPABLE",
 *       "status": 200,
 *       "hasContent": true,
 *       "isJavaScriptOnly": false,
 *       "blockageType": "NONE",
 *       "message": "Cette source peut être scrappée directement...",
 *       "recommendations": [
 *         "La source sera scrappée toutes les 6 heures par défaut",
 *         "Vous pouvez ajuster la fréquence de scraping..."
 *       ],
 *       "logs": [...]
 *     },
 *     "suggestedSourceType": "BLOG",
 *     "suggestedConfig": {
 *       "url": "https://techblog.example.com",
 *       "scrapingFrequency": 21600,
 *       "method": "cheerio"
 *     },
 *     "requiresUserAction": false
 *   },
 *   "timestamp": "2026-01-28T10:30:00.000Z"
 * }
 */

// ============================================================================
// 6. ANALYSE BATCH
// ============================================================================

/**
 * Exemple 4: Analyser plusieurs URLs à la fois
 * 
 * const urls = [
 *   'https://blog1.example.com',
 *   'https://protected.example.com',
 *   'https://forum.example.com',
 *   'https://invalid-url'
 * ];
 * 
 * curl -X POST http://localhost:5001/api/sources/analyze/batch \
 *   -H "Content-Type: application/json" \
 *   -d "{\"urls\": $(echo $urls | jq -R 'split(\" \")')}"
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": {
 *     "total": 4,
 *     "results": [
 *       {
 *         "diagnostic": { "strategy": "SCRAPABLE", ... },
 *         "requiresUserAction": false
 *       },
 *       {
 *         "diagnostic": { "strategy": "GOOGLE_SEARCH", ... },
 *         "requiresUserAction": false
 *       },
 *       ...
 *     ]
 *   }
 * }
 */

// ============================================================================
// 7. ANALYSER ET CRÉER UNE SOURCE
// ============================================================================

/**
 * Exemple 5: Analyser et créer automatiquement une source
 * 
 * curl -X POST http://localhost:5001/api/sources/analyze-and-create \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "url": "https://techblog.example.com",
 *     "brandId": "550e8400-e29b-41d4-a716-446655440000",
 *     "name": "TechBlog",
 *     "organizationId": "550e8400-e29b-41d4-a716-446655440001"
 *   }'
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": {
 *     "analysis": { ... },
 *     "source": {
 *       "id": "...",
 *       "name": "TechBlog",
 *       "type": "BLOG",
 *       "url": "https://techblog.example.com",
 *       "scrapingFrequency": 21600,
 *       "config": {
 *         "url": "...",
 *         "analysisMeta": {
 *           "blockageDetected": "NONE",
 *           "isJavaScriptOnly": false,
 *           "analyzedAt": "2026-01-28T10:30:00.000Z"
 *         }
 *       }
 *     },
 *     "created": true
 *   }
 * }
 */

// ============================================================================
// 8. INTERPRÉTATION DES STRATÉGIES
// ============================================================================

/**
 * SCRAPABLE: Source scrappable directement
 * ├─ Propriétés:
 * │  ├─ HTML valide disponible
 * │  ├─ Pas de blocage (Cloudflare, WAF, etc.)
 * │  ├─ robots.txt permet le scraping
 * │  └─ Pas JS-only
 * └─ Actions:
 *    ├─ Scraper avec Cheerio/Playwright
 *    ├─ Fréquence: 6 heures (par défaut)
 *    └─ Processeur: scraping.processor
 * 
 * GOOGLE_SEARCH: Passer par Google Search API
 * ├─ Propriétés:
 * │  ├─ Source bloquée (Cloudflare, reCAPTCHA, WAF)
 * │  ├─ robots.txt refuse le scraping
 * │  ├─ JavaScript-only
 * │  └─ Pas de contenu directement accessible
 * └─ Actions:
 *    ├─ Utiliser Google Search API
 *    ├─ Chercher: brand + keywords
 *    └─ Fréquence: 24 heures (API limit)
 * 
 * API_REQUIRED: Nécessite une clé API
 * ├─ Propriétés:
 * │  ├─ Content-Type: application/json
 * │  ├─ Endpoint d'API détecté
 * │  └─ Authentification requise
 * └─ Actions:
 *    ├─ Demander la clé API utilisateur
 *    ├─ Valider les credentials
 *    └─ Utiliser le collector API spécifique
 * 
 * UNSUPPORTED: Non supporté
 * ├─ Propriétés:
 * │  ├─ URL invalide
 * │  ├─ Ressource non trouvée (404)
 * │  ├─ Serveur inaccessible
 * │  └─ Contenu vide
 * └─ Actions:
 *    ├─ Afficher erreur à l'utilisateur
 *    ├─ Suggérer alternatives
 *    └─ Ne pas créer de source
 */

// ============================================================================
// 9. DÉTECTION DES BLOCAGES
// ============================================================================

/**
 * Blocages détectés automatiquement:
 * 
 * CLOUDFLARE
 * ├─ En-têtes HTTP:
 * │  ├─ server: cloudflare
 * │  ├─ cf-ray: ...
 * │  └─ cf-connecting-ip: ...
 * ├─ Contenu HTML:
 * │  └─ "Cloudflare", "cf_clearance"
 * └─ Résolution: Google Search API
 * 
 * RECAPTCHA
 * ├─ HTML:
 * │  ├─ g-recaptcha
 * │  ├─ hcaptcha
 * │  └─ grecaptcha script
 * └─ Résolution: Google Search API
 * 
 * WAF (Web Application Firewall)
 * ├─ Messages:
 * │  ├─ "Web Application Firewall"
 * │  ├─ "Access Denied"
 * │  └─ "403 Forbidden"
 * └─ Résolution: Google Search API
 * 
 * JAVASCRIPT-ONLY
 * ├─ Frameworks détectés:
 * │  ├─ Next.js (__NEXT_DATA__)
 * │  ├─ Nuxt (__NUXT__)
 * │  ├─ React (React...)
 * │  ├─ Vue (data-v-app)
 * │  └─ Angular (ng-app)
 * └─ Résolution: Google Search API ou Playwright
 */

// ============================================================================
// 10. ROBOTS.TXT
// ============================================================================

/**
 * Vérification automatique du robots.txt:
 * 
 * ✅ Permet le scraping:
 * User-agent: *
 * Disallow: /admin
 * Disallow: /private
 * 
 * ❌ Refuse le scraping:
 * User-agent: *
 * Disallow: /
 * 
 * ✅ Pas de robots.txt:
 * → Scraping autorisé par défaut
 */

// ============================================================================
// 11. LOGGING & DEBUGGING
// ============================================================================

/**
 * Accéder aux logs détaillés:
 * 
 * const diagnostic = await analyzer.analyze('https://example.com');
 * 
 * diagnostic.logs.forEach(log => {
 *   console.log(`[${log.timestamp.toISOString()}] ${log.level} - ${log.step}`);
 *   console.log(`  ${log.message}`);
 *   if (log.details) {
 *     console.log('  Détails:', log.details);
 *   }
 *   if (log.duration) {
 *     console.log(`  Durée: ${log.duration}ms`);
 *   }
 * });
 * 
 * Logs disponibles:
 * ├─ INIT: Début de l'analyse
 * ├─ CONNECTION: Test de connexion
 * ├─ FETCH: Récupération du contenu
 * ├─ ANALYZE_CONTENT: Analyse du HTML
 * ├─ ROBOTS: Vérification de robots.txt
 * ├─ STRATEGY: Détermination de la stratégie
 * ├─ COMPLETE: Fin de l'analyse
 * └─ ERROR: Erreurs rencontrées
 */

// ============================================================================
// 12. GESTION DES ERREURS
// ============================================================================

/**
 * Try-catch complet:
 * 
 * try {
 *   const analyzer = new SourceAnalyzer();
 *   const diagnostic = await analyzer.analyze(url);
 * 
 *   switch (diagnostic.strategy) {
 *     case CollectionStrategy.SCRAPABLE:
 *       // Créer source web
 *       break;
 *     case CollectionStrategy.GOOGLE_SEARCH:
 *       // Vérifier Google Search API
 *       break;
 *     case CollectionStrategy.API_REQUIRED:
 *       // Demander clé API
 *       break;
 *     case CollectionStrategy.UNSUPPORTED:
 *       // Afficher erreur
 *       break;
 *   }
 * } catch (error) {
 *   console.error('Erreur lors de l\'analyse:', error);
 *   // Afficher message d'erreur générique
 * }
 */

// ============================================================================
// 13. PERFORMANCE
// ============================================================================

/**
 * Optimisations appliquées:
 * 
 * ✅ Timeout: 10 secondes (configurable)
 * ✅ Retries: 2 tentatives automatiques
 * ✅ HEAD request en premier (plus rapide)
 * ✅ Content-length limit: 5MB
 * ✅ Logs optionnels (includeDebugLogs=false)
 * 
 * Temps moyen par URL:
 * ├─ Scrapable: 200-500ms
 * ├─ Bloquée: 300-700ms
 * ├─ Erreur: 100-200ms
 * └─ Batch (10 URLs): 2-5 secondes
 */

// ============================================================================
// 14. EXTENSIBILITÉ
// ============================================================================

/**
 * Ajouter une nouvelle détection de blocage:
 * 
 * // Dans source-analyzer.ts, méthode detectBlockage():
 * 
 * private readonly CUSTOM_INDICATORS = ['Custom Blocker'];
 * 
 * if (html.includes('Custom Blocker')) {
 *   return BlockageType.CUSTOM; // Ajouter à l'enum
 * }
 * 
 * // Ajouter une nouvelle stratégie:
 * 
 * enum CollectionStrategy {
 *   CUSTOM_STRATEGY = 'CUSTOM_STRATEGY'
 * }
 * 
 * // Mettre à jour determineStrategy()
 */

// ============================================================================
// 15. INTÉGRATION AVEC LES WORKERS
// ============================================================================

/**
 * Workflow complet:
 * 
 * 1️⃣ Utilisateur soumet une URL via l'API
 *    POST /api/sources/analyze-and-create
 * 
 * 2️⃣ SourceAnalyzer détecte la stratégie
 *    → SCRAPABLE: Crée une source de type BLOG/FORUM/etc.
 *    → GOOGLE_SEARCH: Crée une source de type NEWS
 *    → UNSUPPORTED: Retourne une erreur
 * 
 * 3️⃣ Une source est créée dans la BD avec la config
 *    config: {
 *      url: "https://...",
 *      analysisMeta: { blockageDetected, isJavaScriptOnly, ... }
 *    }
 * 
 * 4️⃣ Le worker scraping.processor récupère la source
 *    ├─ Regarde config.analysisMeta
 *    ├─ Si isJavaScriptOnly: utilise Playwright
 *    └─ Sinon: utilise Cheerio
 * 
 * 5️⃣ Le collector utilise la meilleure stratégie
 *    ├─ Si SCRAPABLE: scrape directement
 *    ├─ Si GOOGLE_SEARCH: utilise Google Search API
 *    └─ Si API_REQUIRED: utilise la clé API
 * 
 * 6️⃣ Les mentions sont collectées et stockées
 *    Source.lastScrapedAt = now
 *    Source.errorCount = 0 (si succès)
 */

export {};
