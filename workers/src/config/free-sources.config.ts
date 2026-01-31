/**
 * 🆓 Configuration Centralisée des Sources Gratuites
 * 
 * Toutes ces sources utilisent des APIs officielles et sont 100% légales
 * Quotas gratuits calculés pour une utilisation de production
 */

export const FREE_SOURCES_CONFIG = {
  GOOGLE_REVIEWS: {
    enabled: true,
    name: 'Google My Business Reviews',
    requiresAuth: true,
    authType: 'api_key',
    envVar: 'GOOGLE_PLACES_API_KEY',
    
    quota: {
      daily: 2500,
      rateLimit: '50 requests/second',
      cost: 'FREE (2,500/day), then $17/1,000 requests',
    },
    
    api: {
      baseUrl: 'https://maps.googleapis.com/maps/api',
      endpoints: {
        placeDetails: '/place/details/json',
        nearbySearch: '/place/nearbysearch/json',
      }
    },
    
    features: [
      'Reviews with ratings (1-5 stars)',
      'Author names and photos',
      'Review timestamps',
      'Owner responses',
      'Review photos',
    ],
    
    documentation: 'https://developers.google.com/maps/documentation/places/web-service/overview',
  },

  REDDIT: {
    enabled: true,
    name: 'Reddit Discussions',
    requiresAuth: false,
    authType: 'none',
    envVar: null,
    
    quota: {
      daily: Infinity,
      rateLimit: '60 requests/minute (without auth)',
      cost: 'FREE (Unlimited)',
    },
    
    api: {
      baseUrl: 'https://www.reddit.com',
      endpoints: {
        search: '/r/{subreddit}/search.json',
        hot: '/r/{subreddit}/hot.json',
        new: '/r/{subreddit}/new.json',
        comments: '/r/{subreddit}/comments/{post_id}.json',
      }
    },
    
    features: [
      'Posts and comments',
      'Upvotes/downvotes (engagement metrics)',
      'Author karma and history',
      'Subreddit-specific discussions',
      'Real-time data',
    ],
    
    documentation: 'https://www.reddit.com/dev/api/',
  },

  YOUTUBE: {
    enabled: true,
    name: 'YouTube Comments',
    requiresAuth: true,
    authType: 'api_key',
    envVar: 'YOUTUBE_API_KEY',
    
    quota: {
      daily: 10000,
      rateLimit: '10,000 units/day (commentThreads.list = 1 unit)',
      cost: 'FREE (10,000 units/day)',
    },
    
    api: {
      baseUrl: 'https://www.googleapis.com/youtube/v3',
      endpoints: {
        commentThreads: '/commentThreads',
        comments: '/comments',
        videos: '/videos',
      }
    },
    
    features: [
      'Video comments',
      'Comment replies',
      'Like counts',
      'Author channel info',
      'Timestamps',
    ],
    
    documentation: 'https://developers.google.com/youtube/v3/docs',
  },

  YELP: {
    enabled: true,
    name: 'Yelp Business Reviews',
    requiresAuth: true,
    authType: 'api_key',
    envVar: 'YELP_API_KEY',
    
    quota: {
      daily: 5000,
      rateLimit: '5,000 requests/day',
      cost: 'FREE (5,000/day)',
    },
    
    api: {
      baseUrl: 'https://api.yelp.com/v3',
      endpoints: {
        businessSearch: '/businesses/search',
        businessDetails: '/businesses/{id}',
        businessReviews: '/businesses/{id}/reviews',
      }
    },
    
    features: [
      'Business reviews (max 3 per request)',
      'Ratings (1-5 stars)',
      'User profiles',
      'Business info (location, category)',
      'Review timestamps',
    ],
    
    documentation: 'https://www.yelp.com/developers/documentation/v3',
  },

  NEWS_API: {
    enabled: true,
    name: 'News Articles (NewsAPI.org)',
    requiresAuth: true,
    authType: 'api_key',
    envVar: 'NEWS_API_KEY',
    
    quota: {
      daily: 100,
      rateLimit: '100 requests/day',
      cost: 'FREE (100/day, articles from last 30 days)',
    },
    
    api: {
      baseUrl: 'https://newsapi.org/v2',
      endpoints: {
        everything: '/everything',
        topHeadlines: '/top-headlines',
        sources: '/sources',
      }
    },
    
    features: [
      'News articles from 80,000+ sources',
      'Search by keywords',
      'Filter by date, language, source',
      'Article title, description, content',
      'Source metadata',
    ],
    
    limitations: [
      'Free tier: Articles from last 30 days only',
      'No commercial use on free tier',
      '100 requests per day',
    ],
    
    documentation: 'https://newsapi.org/docs',
  },
} as const;

export type FreeSourceType = keyof typeof FREE_SOURCES_CONFIG;

/**
 * Vérifie si une source gratuite est activée
 */
export function isFreeSourceEnabled(type: FreeSourceType): boolean {
  return FREE_SOURCES_CONFIG[type]?.enabled === true;
}

/**
 * Vérifie si les credentials sont configurés
 */
export function validateSourceCredentials(type: FreeSourceType): boolean {
  const config = FREE_SOURCES_CONFIG[type];
  
  if (!config.requiresAuth) return true;
  
  const envValue = process.env[config.envVar!];
  return !!envValue && envValue.length > 0;
}

/**
 * Retourne les sources non configurées
 */
export function getUnconfiguredSources(): Array<{
  type: FreeSourceType;
  name: string;
  envVar: string;
}> {
  return (Object.keys(FREE_SOURCES_CONFIG) as FreeSourceType[])
    .filter(type => {
      const config = FREE_SOURCES_CONFIG[type];
      return config.enabled && 
             config.requiresAuth && 
             !validateSourceCredentials(type);
    })
    .map(type => ({
      type,
      name: FREE_SOURCES_CONFIG[type].name,
      envVar: FREE_SOURCES_CONFIG[type].envVar!,
    }));
}

/**
 * Calcule le quota total disponible
 */
export function getTotalDailyQuota(): number {
  return Object.values(FREE_SOURCES_CONFIG)
    .filter(c => c.enabled)
    .reduce((sum, c) => {
      const daily = c.quota.daily;
      return sum + (daily === Infinity ? 1000000 : daily);
    }, 0);
}

/**
 * Affiche un résumé de la configuration
 */
export function printConfigSummary(): void {
  console.log('\n📊 FREE SOURCES CONFIGURATION\n');
  console.log('═'.repeat(70) + '\n');
  
  Object.entries(FREE_SOURCES_CONFIG).forEach(([type, config]) => {
    const status = config.requiresAuth 
      ? (validateSourceCredentials(type as FreeSourceType) ? '✅' : '❌')
      : '✅';
    
    console.log(`${status} ${config.name}`);
    console.log(`   Type: ${type}`);
    console.log(`   Quota: ${config.quota.daily === Infinity ? 'Unlimited' : config.quota.daily + '/day'}`);
    console.log(`   Auth: ${config.requiresAuth ? `Required (${config.envVar})` : 'Not required'}`);
    
    if (config.requiresAuth && !validateSourceCredentials(type as FreeSourceType)) {
      console.log(`   ⚠️  Missing ${config.envVar} in .env`);
    }
    
    console.log('');
  });
  
  const total = getTotalDailyQuota();
  console.log('═'.repeat(70));
  console.log(`Total daily quota: ${total.toLocaleString()} requests\n`);
}
