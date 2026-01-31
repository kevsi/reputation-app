/**
 * 🚫 Forbidden Domains Configuration (Workers)
 * 
 * Synchronisé avec api/src/shared/config/forbidden-domains.ts
 * Utilisé pour vérifier que les workers ne tentent pas de scraper des domaines interdits
 * 
 * À EXCLURE:
 * - Twitter/X: API payante + Scraping interdit
 * - Facebook: API payante + Scraping interdit
 * - LinkedIn: API payante + Scraping interdit
 * - Telegram: Scraping interdit
 * 
 * AUTORISÉS:
 * - Forums, Blogs, News: Scraping autorisé
 * - Reddit: Avec API (recommandée)
 */

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
 * Types de source complètement interdits
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
 */
export function isForbiddenDomain(url: string | undefined): boolean {
  if (!url) return false;

  const lowerUrl = url.toLowerCase().trim();
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(lowerUrl));
}

/**
 * Vérifie si un type de source est interdit
 */
export function isForbiddenSourceType(sourceType: string | undefined): boolean {
  if (!sourceType) return false;
  return FORBIDDEN_SOURCE_TYPES.includes(sourceType.toUpperCase());
}

/**
 * Valide une source avant de scraper
 */
export function validateSourceBeforeScraping(
  sourceType: string | undefined,
  url: string | undefined
): { valid: boolean; reason?: string } {
  if (isForbiddenSourceType(sourceType)) {
    return {
      valid: false,
      reason: `Source type ${sourceType} is forbidden`,
    };
  }

  if (url && isForbiddenDomain(url)) {
    return {
      valid: false,
      reason: `Domain ${url} is forbidden`,
    };
  }

  return { valid: true };
}

export { FORBIDDEN_PATTERNS, FORBIDDEN_SOURCE_TYPES };
