/**
 * 🚫 Forbidden Domains Configuration
 * 
 * Listes des domaines/plateformes avec API payante ET scraping interdit.
 * Basé sur l'analyse:
 * - Twitter/X: API payante ✅ + Scraping interdit ❌ → EXCLURE
 * - Facebook: API payante ✅ + Scraping interdit ❌ → EXCLURE
 * - LinkedIn: API payante ✅ + Scraping interdit ❌ → EXCLURE
 * - Telegram: API libre ❌ + Scraping interdit ❌ → EXCLURE (pour l'instant)
 * 
 * AUTORISÉS:
 * - Forums: Scraping autorisé ✅
 * - Blogs: Scraping autorisé ✅
 * - Reddit: API disponible (recommandée) ⚠️
 * 
 * ⚠️ Ces sources NE PEUVENT PAS être ajoutées via l'API
 */

/**
 * Domaines à exclure (API payante + Scraping interdit)
 */
const FORBIDDEN_DOMAINS = {
  // Réseaux sociaux avec API payante et scraping interdit
  SOCIAL_MEDIA_PAID: [
    'twitter.com',
    'x.com',                          // Twitter/X
    'facebook.com',
    'fb.com',                         // Facebook
    'linkedin.com',
  ],

  // Messagerie/Chat avec scraping interdit
  MESSAGING: [
    'telegram.org',
    'telegram.me',
    'telegram.com',
  ],
};

/**
 * Règles regex pour détecter les domaines interdits
 */
const FORBIDDEN_PATTERNS = [
  /^(https?:\/\/)?(www\.)?twitter\.com/i,
  /^(https?:\/\/)?(www\.)?x\.com/i,
  /^(https?:\/\/)?(www\.)?facebook\.com/i,
  /^(https?:\/\/)?(www\.)?fb\.com/i,
  /^(https?:\/\/)?(www\.)?linkedin\.com/i,
  /^(https?:\/\/)?(www\.)?telegram\.(org|me|com)/i,
];

/**
 * Domaines AUTORISÉS (whitelist)
 * Pour les sources sans configuration URL
 */
const ALLOWED_PLATFORM_TYPES = [
  'FORUM',                           // Forums publics génériques
  'BLOG',                            // Blogs personnels/publics
  'NEWS',                            // Sites d'actualités
  'RSS',                             // Flux RSS
  'REVIEW',                          // Avis sur plateformes autorisées
  'REDDIT',                          // Reddit (avec API recommandée)
  'OTHER',                           // Autres sources personnalisées
];

/**
 * Types de sources interdits (provenant de plateformes avec API payante + scraping interdit)
 */
const FORBIDDEN_SOURCE_TYPES = [
  'TWITTER',
  'FACEBOOK',
  'LINKEDIN',
  'INSTAGRAM',
  'YOUTUBE',
  'GOOGLE_REVIEWS',
  'TRUSTPILOT',
  'TRIPADVISOR',
];

/**
 * Vérifie si un URL/domaine est interdit
 * 
 * @param url - URL complète ou domaine
 * @returns Object avec { isBlocked: boolean, reason: string }
 */
export function checkForbiddenDomain(url: string | undefined): {
  isBlocked: boolean;
  reason?: string;
  platformName?: string;
} {
  if (!url) {
    return { isBlocked: false };
  }

  const lowerUrl = url.toLowerCase().trim();

  // Vérifier avec les patterns regex
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(lowerUrl)) {
      const platformName = extractPlatformName(lowerUrl);
      return {
        isBlocked: true,
        reason: `Cette plateforme (${platformName}) nécessite une API payante ou interdit le scraping. Consultez nos conditions d'utilisation.`,
        platformName,
      };
    }
  }

  return { isBlocked: false };
}

/**
 * Extrait le nom de la plateforme depuis une URL
 */
export function extractPlatformName(url: string): string {
  const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
  const domain = urlObj.hostname.replace('www.', '').replace('maps.', '');
  
  const platformMap: Record<string, string> = {
    'twitter.com': 'Twitter/X',
    'x.com': 'Twitter/X',
    'facebook.com': 'Facebook',
    'fb.com': 'Facebook',
    'linkedin.com': 'LinkedIn',
    'telegram.org': 'Telegram',
    'telegram.me': 'Telegram',
    'telegram.com': 'Telegram',
  };

  return platformMap[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
}

/**
 * Valide une source avant sa création
 * 
 * @param sourceType - Type de source (TWITTER, FACEBOOK, etc.)
 * @param url - URL si applicable
 * @returns Object avec { valid: boolean, error?: string }
 */
export function validateSourceAllowed(
  sourceType: string,
  url: string | undefined,
): {
  valid: boolean;
  error?: string;
} {
  // Vérifier d'abord les types de source interdits
  if (FORBIDDEN_SOURCE_TYPES.includes(sourceType.toUpperCase())) {
    return {
      valid: false,
      error: `Le type de source ${sourceType} n'est pas autorisé. Cette plateforme nécessite une API payante ou interdit le scraping.`,
    };
  }

  // Pour les types avec URL, vérifier l'URL
  if (url) {
    const forbidden = checkForbiddenDomain(url);
    if (forbidden.isBlocked) {
      return {
        valid: false,
        error: forbidden.reason,
      };
    }
  }

  return { valid: true };
}

/**
 * Retourne la liste des domaines interdits (pour documentation)
 */
export function getForbiddenDomainsList(): typeof FORBIDDEN_DOMAINS {
  return FORBIDDEN_DOMAINS;
}

/**
 * Retourne la liste des patterns interdits (pour documentation)
 */
export function getForbiddenPatterns(): RegExp[] {
  return FORBIDDEN_PATTERNS;
}

export {
  FORBIDDEN_DOMAINS,
  FORBIDDEN_SOURCE_TYPES,
  FORBIDDEN_PATTERNS,
  ALLOWED_PLATFORM_TYPES,
};
