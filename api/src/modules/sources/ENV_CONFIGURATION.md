/**
 * 🔧 Configuration et Variables d'Environnement pour SourceAnalyzer
 * 
 * Ajouter ces variables à votre fichier .env
 */

// ============================================================================
// CONFIGURATION SOURCEANALYZER
// ============================================================================

/**
 * Timeout pour les requêtes HTTP d'analyse (en millisecondes)
 * Par défaut: 10000 (10 secondes)
 * Min: 1000 (1 seconde)
 * Max: 60000 (1 minute)
 */
ANALYZER_TIMEOUT=10000

/**
 * Nombre de tentatives automatiques en cas d'erreur réseau
 * Par défaut: 2
 * Min: 0 (pas de retry)
 * Max: 5
 */
ANALYZER_MAX_RETRIES=2

/**
 * User-Agent à utiliser pour les requêtes HTTP
 * Si vide, utilise le User-Agent par défaut (navigateur moderne)
 * Note: Respecter les normes (pas de scraper agressif)
 */
ANALYZER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36

/**
 * Taille maximale du contenu à analyser (en bytes)
 * Par défaut: 5242880 (5MB)
 * Note: Les pages plus grandes seront tronquées
 */
ANALYZER_MAX_CONTENT_LENGTH=5242880

/**
 * Activer les logs de debug (très verbeux)
 * Options: true | false
 * Par défaut: false
 * Note: À utiliser uniquement en développement
 */
ANALYZER_DEBUG_LOGS=false

// ============================================================================
// CONFIGURATION GOOGLE SEARCH API (pour stratégie GOOGLE_SEARCH)
// ============================================================================

/**
 * Clé API Google Custom Search
 * Obtenir à: https://console.cloud.google.com/
 */
GOOGLE_SEARCH_API_KEY=your_api_key_here

/**
 * ID du moteur de recherche personnalisé Google
 * Créé sur: https://cse.google.com/cse/
 */
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

/**
 * Résultats par requête Google Search
 * Options: 1-10
 * Par défaut: 10
 */
GOOGLE_SEARCH_RESULTS_PER_PAGE=10

/**
 * Nombre maximum de requêtes Google Search par jour
 * Par défaut: 100 (limite gratuite)
 * Note: Adapter selon votre plan de facturation
 */
GOOGLE_SEARCH_DAILY_LIMIT=100

/**
 * Délai entre les requêtes Google Search (en ms)
 * Par défaut: 100 (respecter les rate limits)
 */
GOOGLE_SEARCH_REQUEST_DELAY=100

// ============================================================================
// CONFIGURATION ROBOTS.TXT
// ============================================================================

/**
 * Respecter les robots.txt
 * Options: true | false
 * Par défaut: true
 * Note: TOUJOURS à true pour respecter la légalité
 */
ANALYZER_RESPECT_ROBOTS_TXT=true

/**
 * Timeout pour vérifier robots.txt (en ms)
 * Par défaut: 5000
 */
ANALYZER_ROBOTS_TIMEOUT=5000

// ============================================================================
// CONFIGURATION DÉTECTIONS
// ============================================================================

/**
 * Détecter les blocages Cloudflare
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_DETECT_CLOUDFLARE=true

/**
 * Détecter reCAPTCHA et autres captchas
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_DETECT_CAPTCHA=true

/**
 * Détecter les Web Application Firewalls
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_DETECT_WAF=true

/**
 * Détecter les sites JavaScript-only
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_DETECT_JS_ONLY=true

// ============================================================================
// CONFIGURATION RATE LIMITING
// ============================================================================

/**
 * Activer le rate limiting sur les endpoints d'analyse
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_RATE_LIMIT_ENABLED=true

/**
 * Fenêtre de temps pour le rate limiting (en ms)
 * Par défaut: 900000 (15 minutes)
 */
ANALYZER_RATE_LIMIT_WINDOW=900000

/**
 * Nombre maximum de requêtes par fenêtre
 * Par défaut: 100
 * Note: Adapter selon votre capacité
 */
ANALYZER_RATE_LIMIT_MAX_REQUESTS=100

// ============================================================================
// CONFIGURATION LOGGING
// ============================================================================

/**
 * Niveau de log pour SourceAnalyzer
 * Options: 'error' | 'warn' | 'info' | 'debug'
 * Par défaut: 'info'
 */
ANALYZER_LOG_LEVEL=info

/**
 * Enregistrer les logs dans un fichier
 * Options: true | false
 * Par défaut: false
 */
ANALYZER_LOG_TO_FILE=false

/**
 * Chemin du fichier de logs (relatif à la racine du projet)
 * Par défaut: logs/analyzer.log
 */
ANALYZER_LOG_FILE_PATH=logs/analyzer.log

/**
 * Rotation automatique des logs (taille max en MB)
 * Par défaut: 10 (10MB)
 * Note: 0 = pas de rotation
 */
ANALYZER_LOG_FILE_MAX_SIZE=10

// ============================================================================
// CONFIGURATION CACHE (optionnel)
// ============================================================================

/**
 * Activer le cache des analyses
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_CACHE_ENABLED=true

/**
 * Durée du cache (en secondes)
 * Par défaut: 3600 (1 heure)
 * Note: Même URL = même résultat pendant ce délai
 */
ANALYZER_CACHE_TTL=3600

/**
 * Taille maximale du cache (nombre d'URLs)
 * Par défaut: 1000
 */
ANALYZER_CACHE_MAX_SIZE=1000

// ============================================================================
// CONFIGURATION WORKER
// ============================================================================

/**
 * Utiliser SourceAnalyzer automatiquement lors de la création de source
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_AUTO_ANALYZE_ON_CREATE=true

/**
 * Créer automatiquement les sources si supportées
 * Options: true | false
 * Par défaut: false
 * Note: Mettre à true = créer sans confirmation
 */
ANALYZER_AUTO_CREATE_SOURCES=false

/**
 * Notifier l'utilisateur après analyse
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_NOTIFY_ON_COMPLETE=true

// ============================================================================
// CONFIGURATION VALIDATIONS
// ============================================================================

/**
 * URLs interdites (regex séparées par |)
 * Par défaut: Vide (aucune)
 * Exemple: localhost|127.0.0.1|192.168.*
 */
ANALYZER_BLOCKED_URLS=

/**
 * Domaines interdits (séparés par virgules)
 * Par défaut: Vide (aucun)
 * Exemple: internal.company.com,staging.example.com
 */
ANALYZER_BLOCKED_DOMAINS=

/**
 * Protocoles autorisés
 * Par défaut: http,https
 * Note: Garder https pour la sécurité
 */
ANALYZER_ALLOWED_PROTOCOLS=http,https

/**
 * Vérifier les certificats SSL
 * Options: true | false
 * Par défaut: true
 * Note: false seulement en développement
 */
ANALYZER_VERIFY_SSL=true

// ============================================================================
// CONFIGURATION MÉTRIQUES
// ============================================================================

/**
 * Activer le tracking des métriques
 * Options: true | false
 * Par défaut: true
 */
ANALYZER_TRACK_METRICS=true

/**
 * Envoyer les métriques à un service (optionnel)
 * Exemples: prometheus, datadog, cloudwatch
 * Par défaut: Vide (pas d'envoi externe)
 */
ANALYZER_METRICS_SERVICE=

/**
 * Clé d'authentification pour le service de métriques
 * Par défaut: Vide
 */
ANALYZER_METRICS_API_KEY=

// ============================================================================
// EXEMPLE .env COMPLET POUR DÉVELOPPEMENT
// ============================================================================

/**
 * Copier-coller ceci dans votre .env (remplacer les valeurs):
 * 
 * # SourceAnalyzer Configuration
 * ANALYZER_TIMEOUT=10000
 * ANALYZER_MAX_RETRIES=2
 * ANALYZER_DEBUG_LOGS=false
 * ANALYZER_LOG_LEVEL=info
 * 
 * # Google Search API
 * GOOGLE_SEARCH_API_KEY=your_key_here
 * GOOGLE_SEARCH_ENGINE_ID=your_id_here
 * GOOGLE_SEARCH_RESULTS_PER_PAGE=10
 * GOOGLE_SEARCH_DAILY_LIMIT=100
 * 
 * # Robots.txt
 * ANALYZER_RESPECT_ROBOTS_TXT=true
 * 
 * # Détections
 * ANALYZER_DETECT_CLOUDFLARE=true
 * ANALYZER_DETECT_CAPTCHA=true
 * ANALYZER_DETECT_WAF=true
 * ANALYZER_DETECT_JS_ONLY=true
 * 
 * # Rate Limiting
 * ANALYZER_RATE_LIMIT_ENABLED=true
 * ANALYZER_RATE_LIMIT_MAX_REQUESTS=100
 * 
 * # Cache
 * ANALYZER_CACHE_ENABLED=true
 * ANALYZER_CACHE_TTL=3600
 * 
 * # SSL
 * ANALYZER_VERIFY_SSL=true
 */

// ============================================================================
// EXEMPLE .env POUR PRODUCTION
// ============================================================================

/**
 * Configuration recommandée pour la production:
 * 
 * # Performance
 * ANALYZER_TIMEOUT=10000
 * ANALYZER_MAX_RETRIES=2
 * ANALYZER_DEBUG_LOGS=false
 * 
 * # Sécurité
 * ANALYZER_RESPECT_ROBOTS_TXT=true
 * ANALYZER_VERIFY_SSL=true
 * ANALYZER_BLOCKED_DOMAINS=internal.yourcompany.com
 * 
 * # Logging
 * ANALYZER_LOG_LEVEL=warn
 * ANALYZER_LOG_TO_FILE=true
 * ANALYZER_LOG_FILE_MAX_SIZE=10
 * 
 * # Rate Limiting
 * ANALYZER_RATE_LIMIT_ENABLED=true
 * ANALYZER_RATE_LIMIT_MAX_REQUESTS=1000
 * 
 * # Cache
 * ANALYZER_CACHE_ENABLED=true
 * ANALYZER_CACHE_TTL=7200
 * ANALYZER_CACHE_MAX_SIZE=5000
 * 
 * # Google Search
 * GOOGLE_SEARCH_API_KEY=sk_prod_xxx
 * GOOGLE_SEARCH_DAILY_LIMIT=10000
 * 
 * # Auto-création
 * ANALYZER_AUTO_CREATE_SOURCES=false
 * ANALYZER_NOTIFY_ON_COMPLETE=true
 * 
 * # Métriques
 * ANALYZER_TRACK_METRICS=true
 * ANALYZER_METRICS_SERVICE=datadog
 * ANALYZER_METRICS_API_KEY=dd_prod_xxx
 */

export {};
