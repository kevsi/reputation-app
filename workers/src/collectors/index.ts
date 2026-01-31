/**
 * 📦 Collectors Index & Auto-Registration
 * 
 * Central exports for collectors and automatic registration
 * Enregistre UNIQUEMENT les collectors activés dans la configuration
 */

import { CollectorFactory } from './base.collector';
import { isCollectorEnabled, getEnabledCollectorTypes, getDisabledCollectorTypes } from '../config/collectors.config';

// Import all collector classes
import { TrustpilotCollector } from './trustpilot.collector';
import { TwitterCollector } from './twitter.collector';
import { RedditCollector } from './reddit.collector';
import { YouTubeCollector } from './youtube.collector';
import { FacebookCollector } from './facebook.collector';
import { GoogleReviewsCollector } from './google_reviews.collector';
import { WebCollector } from './web.collector';
import { YelpCollector } from './yelp.collector';
import { NewsCollector } from './news.collector';

/**
 * 🚀 Auto-enregistrement conditionnel basé sur la configuration
 * Exécuté au chargement du module
 */
function initializeCollectors() {
  CollectorFactory.initialize();

  // Enregistrement conditionnel de chaque collector
  if (isCollectorEnabled('REDDIT')) {
    CollectorFactory.registerCollector('REDDIT', RedditCollector);
  }

  if (isCollectorEnabled('TWITTER')) {
    CollectorFactory.registerCollector('TWITTER', TwitterCollector);
  }

  if (isCollectorEnabled('YOUTUBE')) {
    CollectorFactory.registerCollector('YOUTUBE', YouTubeCollector);
  }

  if (isCollectorEnabled('FACEBOOK')) {
    CollectorFactory.registerCollector('FACEBOOK', FacebookCollector);
  }

  if (isCollectorEnabled('GOOGLE_REVIEWS')) {
    CollectorFactory.registerCollector('GOOGLE_REVIEWS', GoogleReviewsCollector);
  }

  if (isCollectorEnabled('YELP')) {
    CollectorFactory.registerCollector('YELP', YelpCollector);
  }

  // WebCollector gère FORUM, BLOG - registered as 'WEB' type
  if (isCollectorEnabled('WEB')) {
    CollectorFactory.registerCollector('WEB', WebCollector);
  }

  if (isCollectorEnabled('FORUM')) {
    CollectorFactory.registerCollector('FORUM', WebCollector);
  }

  if (isCollectorEnabled('BLOG')) {
    CollectorFactory.registerCollector('BLOG', WebCollector);
  }

  // NOTE: NewsCollector disabled - signature mismatch with testConnection()
  // if (isCollectorEnabled('NEWS_API')) {
  //   try {
  //     CollectorFactory.registerCollector('NEWS_API', NewsCollector);
  //   } catch (error) {
  //     console.warn('⚠️  NEWS_API collector is enabled but NewsCollector class not found');
  //   }
  // }

  // TRUSTPILOT et autres collectors désactivés NE seront PAS enregistrés
  // La configuration fait autorité - voir src/config/collectors.config.ts

  // Afficher un résumé
  const registered = CollectorFactory.getRegisteredCollectors();
  console.info(`\n📊 Summary: ${registered.length} collectors registered`);
  console.info(`   ✅ ${registered.join(', ')}`);
  
  const disabled = getDisabledCollectorTypes();
  if (disabled.length > 0) {
    console.warn(`   ⏭️  Disabled: ${disabled.map(d => d.type).join(', ')}`);
  }
  
  console.info('✅ Collectors initialization complete\n');
}

// Initialiser les collectors au chargement du module
initializeCollectors();

// Export factory et types
export { CollectorFactory };
export { TrustpilotCollector };
export { TwitterCollector };
export { RedditCollector };
export { YouTubeCollector };
export { FacebookCollector };
export { GoogleReviewsCollector };
export { WebCollector };
export { YelpCollector };
export { NewsCollector };
export type { ICollector, RawMention, CollectorConfig } from './base.collector';
