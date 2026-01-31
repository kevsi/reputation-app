/**
 * 🔧 Configuration Centralisée des Collectors
 * 
 * Définit l'état (activé/désactivé) de tous les collectors disponibles
 * Source unique de vérité pour la validation et l'enregistrement
 */

/**
 * Configuration détaillée d'un collector
 */
export interface CollectorConfigEntry {
  enabled: boolean;
  requiresAuth?: boolean;
  rateLimit?: { requests: number; per: 'minute' | 'hour' | 'day' } | null;
  description?: string;
  reason?: string | null;
  alternative?: string | null;
  cost?: string;
  tier?: 'free' | 'paid' | 'disabled';
}

/**
 * Configuration centralisée de tous les collectors
 * 🆓 FREE = Sources gratuites 100% légales
 * 💰 PAID = Sources payantes ou nécessitant app approval
 * ❌ DISABLED = Désactivées (violations de ToS, etc)
 */
export const AVAILABLE_COLLECTORS = {
  // 🆓 FREE SOURCES (PRIORITÉ)
  GOOGLE_REVIEWS: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 2500, per: 'day' },
    description: 'Google My Business Reviews (FREE API)',
    cost: 'FREE - 2,500 requests/day',
    tier: 'free',
  },
  
  REDDIT: {
    enabled: true,
    requiresAuth: false,
    rateLimit: { requests: 60, per: 'minute' },
    description: 'Reddit Discussions (PUBLIC JSON)',
    cost: 'FREE - Unlimited',
    tier: 'free',
  },
  
  YOUTUBE: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 10000, per: 'day' },
    description: 'YouTube Comments (FREE API)',
    cost: 'FREE - 10,000 units/day',
    tier: 'free',
  },
  
  YELP: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 5000, per: 'day' },
    description: 'Yelp Business Reviews (FREE API)',
    cost: 'FREE - 5,000 requests/day',
    tier: 'free',
  },
  
  NEWS_API: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 100, per: 'day' },
    description: 'NewsAPI.org Articles (FREE API)',
    cost: 'FREE - 100 requests/day',
    tier: 'free',
  },
  
  // 💰 PAID/OTHER SOURCES
  TWITTER: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 100, per: 'minute' },
    description: 'Twitter/X API (Requires paid subscription)',
    cost: 'PAID - $100/month minimum',
    tier: 'paid',
  },
  
  FACEBOOK: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 200, per: 'hour' },
    description: 'Facebook Graph API (Requires app approval)',
    cost: 'FREE (after approval)',
    tier: 'paid',
  },
  
  WEB: {
    enabled: true,
    requiresAuth: false,
    rateLimit: { requests: 1000, per: 'hour' },
    description: 'Generic web scraping (Forum, Blog, Review)',
    cost: 'FREE',
    tier: 'free',
  },

  FORUM: {
    enabled: true,
    requiresAuth: false,
    rateLimit: { requests: 1000, per: 'hour' },
    description: 'Forum discussions and threads',
    cost: 'FREE',
    tier: 'free',
  },

  BLOG: {
    enabled: true,
    requiresAuth: false,
    rateLimit: { requests: 1000, per: 'hour' },
    description: 'Blog posts and articles',
    cost: 'FREE',
    tier: 'free',
  },
  
  // ❌ DISABLED SOURCES
  TRUSTPILOT: {
    enabled: false,
    reason: 'Violates Trustpilot Terms of Service (scraping prohibited) + Expensive API ($299+/month)',
    alternative: 'Use Google Reviews or Yelp instead (FREE & LEGAL)',
    cost: 'PAID - $299+/month (if using official API)',
    tier: 'disabled',
  }
} as const;

/**
 * Type pour tous les types de collectors disponibles
 */
export type CollectorType = keyof typeof AVAILABLE_COLLECTORS;

/**
 * Vérifie si un type de collector est activé (accepte string pour flexibilité)
 * @param type - Type de collector à vérifier
 * @returns true si le collector est activé
 */
export function isCollectorEnabled(type: string): boolean {
  if (!(type in AVAILABLE_COLLECTORS)) {
    return false;
  }
  const config = AVAILABLE_COLLECTORS[type as CollectorType];
  return config?.enabled ?? false;
}

/**
 * Récupère la raison de la désactivation d'un collector
 * @param type - Type de collector
 * @returns La raison ou null si activé
 */
export function getCollectorReason(type: CollectorType): string | null {
  const config = AVAILABLE_COLLECTORS[type];
  return ('reason' in config) ? config.reason : null;
}

/**
 * Récupère la configuration complète d'un collector avec validation
 * Lance une erreur si le type n'existe pas ou si le collector est désactivé
 */
export function getCollectorConfig(type: string): CollectorConfigEntry {
  if (!(type in AVAILABLE_COLLECTORS)) {
    throw new Error(
      `❌ Unknown collector type: "${type}". Available: ${Object.keys(AVAILABLE_COLLECTORS).join(', ')}`
    );
  }

  const config = AVAILABLE_COLLECTORS[type as CollectorType];
  
  if (!config.enabled) {
    const reason = 'reason' in config ? config.reason : 'No reason provided';
    const alternative = 'alternative' in config ? config.alternative : null;
    const errorMsg = `🚫 Collector "${type}" is disabled: ${reason}`;
    if (alternative) {
      throw new Error(`${errorMsg}\n   Alternative: ${alternative}`);
    }
    throw new Error(errorMsg);
  }

  return config;
}

/**
 * Récupère la liste des types de collectors activés
 * @returns Array de CollectorType activés
 */
export function getEnabledCollectorTypes(): CollectorType[] {
  return (Object.keys(AVAILABLE_COLLECTORS) as CollectorType[]).filter(
    (type) => isCollectorEnabled(type)
  );
}

/**
 * Récupère la liste des types de collectors désactivés avec détails
 * @returns Array d'objets {type, reason, alternative}
 */
export function getDisabledCollectorTypes() {
  return (Object.keys(AVAILABLE_COLLECTORS) as CollectorType[])
    .filter((type) => !isCollectorEnabled(type))
    .map((type) => {
      const config = AVAILABLE_COLLECTORS[type];
      return {
        type,
        reason: ('reason' in config) ? config.reason : 'Unknown',
        alternative: ('alternative' in config) ? config.alternative : undefined
      };
    });
}

/**
 * Liste les collectors activés avec leurs details
 */
export function getEnabledCollectorsList() {
  return getEnabledCollectorTypes().map((type) => {
    const config = AVAILABLE_COLLECTORS[type];
    return {
      type,
      description: ('description' in config) ? config.description : '',
      requiresAuth: ('requiresAuth' in config) ? config.requiresAuth : false,
      rateLimit: ('rateLimit' in config) ? config.rateLimit : undefined
    };
  });
}

/**
 * Valide si un type de collector existe dans la configuration
 * @param type - Type à valider
 * @returns true si le type existe
 */
export function isValidCollectorType(type: string): type is CollectorType {
  return type in AVAILABLE_COLLECTORS;
}

/**
 * Récupère un message d'erreur formaté pour un collector indisponible
 * @param type - Type de collector
 * @returns Message d'erreur explicite
 */
export function getUnavailableCollectorMessage(type: string): string {
  if (!isValidCollectorType(type)) {
    return `❌ Invalid collector type: "${type}". Available: ${Object.keys(AVAILABLE_COLLECTORS).join(', ')}`;
  }

  const config = AVAILABLE_COLLECTORS[type];
  if (!config.enabled) {
    const reason = ('reason' in config) ? config.reason : 'Unknown reason';
    const msg = `🚫 Collector "${type}" is disabled: ${reason}`;
    if ('alternative' in config && config.alternative) {
      return `${msg}\n   👉 Alternative: ${config.alternative}`;
    }
    return msg;
  }

  return `❌ Collector "${type}" is not registered`;
}
