import { ScraperEngine } from '../engine/scraper.engine';
import { ScraperConfig } from '../types/scraping.types';
import { SourceType } from '@prisma/client';

async function runExamples() {
    const engine = new ScraperEngine();

    // 1. Forum Example (CommentCaMarche)
    const forumConfig: ScraperConfig = {
        name: 'CommentCaMarche Forum',
        url: 'https://www.commentcamarche.net/forum/s/reputation',
        type: SourceType.FORUM,
        selectors: {
            container: '.forum-thread', // Example selector
            title: '.forum-thread-title',
            content: '.forum-thread-content',
            author: '.forum-thread-author',
            date: '.forum-thread-date'
        }
    };

    // 2. News Example (Le Monde)
    const newsConfig: ScraperConfig = {
        name: 'Le Monde',
        url: 'https://www.lemonde.fr/recherche/?search_keywords=reputation',
        type: SourceType.NEWS,
        selectors: {
            container: '.teaser',
            title: '.teaser__title',
            content: '.teaser__excerpt',
            author: '.teaser__author',
            date: '.teaser__date'
        }
    };

    // 3. Review Example (Trustpilot - Public profile)
    const reviewConfig: ScraperConfig = {
        name: 'Trustpilot Example',
        url: 'https://www.trustpilot.com/review/google.com',
        type: SourceType.TRUSTPILOT,
        selectors: {
            container: '[data-review-content]',
            title: 'h2',
            content: '[data-service-review-text-typography]',
            author: '[data-consumer-name-typography]',
            date: '[data-service-review-date-of-experience-typography]'
        }
    };

    console.log('--- TEST SCRAPING START ---');

    // Note: These URLs and selectors are illustrative. 
    // In a real scenario, you would need to verify the exact CSS selectors for each site.

    /*
    try {
      const forumResults = await engine.scrape(forumConfig);
      console.log('Forum Results:', forumResults.slice(0, 2));
      
      const newsResults = await engine.scrape(newsConfig);
      console.log('News Results:', newsResults.slice(0, 2));
    } catch (error) {
      console.error('Error during examples:', error);
    }
    */

    console.log('--- TEST SCRAPING END ---');
}

// runExamples();
