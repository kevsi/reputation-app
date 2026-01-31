import { IFetcher, CheerioFetcher, PlaywrightFetcher } from './fetcher';
import { BaseParser, GenericWebParser } from '../parsers/base.parser';
import { ForumParser } from '../parsers/forum.parser';
import { ReviewParser } from '../parsers/review.parser';
import { ScraperConfig, ScrapedMention } from '../types/scraping.types';
import { SourceType } from '@sentinelle/database';

export class ScraperEngine {
    private static fetchers: Map<string, IFetcher> = new Map();
    private static parsers: Map<SourceType, BaseParser> = new Map();

    static initialize() {
        this.fetchers.set('static', new CheerioFetcher());
        this.fetchers.set('dynamic', new PlaywrightFetcher());

        const genericParser = new GenericWebParser();
        this.parsers.set(SourceType.NEWS, genericParser);
        this.parsers.set(SourceType.BLOG, genericParser);
        this.parsers.set(SourceType.FORUM, new ForumParser());
        this.parsers.set(SourceType.TRUSTPILOT, new ReviewParser());
        this.parsers.set(SourceType.GOOGLE_REVIEWS, new ReviewParser());
        this.parsers.set(SourceType.REVIEW, new ReviewParser());
        this.parsers.set(SourceType.OTHER, genericParser);
    }

    async scrape(config: ScraperConfig): Promise<ScrapedMention[]> {
        console.log(`[ScraperEngine] Starting scrape for: ${config.name} (${config.url})`);

        const fetcher = config.useDynamicLoading
            ? ScraperEngine.fetchers.get('dynamic')
            : ScraperEngine.fetchers.get('static');

        if (!fetcher) throw new Error('Fetcher not found');

        const parser = ScraperEngine.parsers.get(config.type) || ScraperEngine.parsers.get(SourceType.OTHER)!;

        try {
            // 1. Fetch
            const html = await fetcher.fetchHtml(config.url, config.headers);

            // 2. Parse
            const results = parser.parse(html, config);

            // 3. Rate limiting (if applicable for batching)
            if (config.rateLimitMs) {
                await new Promise(resolve => setTimeout(resolve, config.rateLimitMs));
            }

            console.log(`[ScraperEngine] Successfully scraped ${results.length} items from ${config.name}`);
            return results;
        } catch (error) {
            console.error(`[ScraperEngine] Failed to scrape ${config.name}:`, error);
            throw error;
        }
    }
}

// Ensure engine is initialized
ScraperEngine.initialize();
