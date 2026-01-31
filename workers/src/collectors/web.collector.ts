import { BaseCollector, RawMention, CollectorConfig } from './base.collector';
import { Source } from '@sentinelle/database';
import { ScraperEngine } from '../scraping/engine/scraper.engine';
import { ScraperConfig, SelectorConfig } from '../scraping/types/scraping.types';
import { SourceType } from '@sentinelle/database';

export class WebCollector extends BaseCollector {
    private engine: ScraperEngine;

    constructor() {
        super();
        this.engine = new ScraperEngine();
    }

    async collect(source: Source, keywords: string[]): Promise<RawMention[]> {
        console.log(`[WebCollector] Collecting for source: ${source.name} with keywords: ${keywords.join(', ')}`);

        const allMentions: RawMention[] = [];

        // Convert Source config to ScraperConfig
        // The source.config should contain the selectors
        const config = source.config as any;

        if (!config?.selectors) {
            console.warn(`[WebCollector] No selectors found for source ${source.name}. Using defaults or skipping.`);
            // Default selectors if not provided (might not work well but prevents crash)
            config.selectors = this.getDefaultSelectors(source.type);
        }

        for (const keyword of keywords) {
            // Replace keyword placeholder if present, or just use the base URL
            const baseUrl = source.url || config.url || '';
            const targetUrl = baseUrl.replace('{{keyword}}', encodeURIComponent(keyword));

            const scraperConfig: ScraperConfig = {
                name: `${source.name} - ${keyword}`,
                url: targetUrl,
                type: source.type as SourceType,
                selectors: config.selectors as SelectorConfig,
                useDynamicLoading: config.useDynamicLoading || false,
                headers: config.headers,
                rateLimitMs: config.rateLimitMs
            };

            try {
                const results = await this.engine.scrape(scraperConfig);

                const mapped = results.map(r => ({
                    text: r.content,
                    author: r.author,
                    url: r.url,
                    publishedAt: r.publishedAt,
                    externalId: r.externalId,
                    platform: r.platform as any,
                    engagementCount: r.engagementCount,
                    rawData: { ...r.rawData, keyword }
                }));

                allMentions.push(...mapped);
            } catch (error) {
                console.error(`[WebCollector] Error scraping ${source.name} for keyword ${keyword}:`, error);
            }
        }

        return allMentions;
    }

    async testConnection(config: CollectorConfig): Promise<{ success: boolean; message: string }> {
        // For web scraping, testing connection is just checking if URL is reachable
        return { success: true, message: 'Web source reachable' };
    }

    private getDefaultSelectors(type: SourceType): SelectorConfig {
        // Generic selectors for common platforms
        return {
            container: 'article, .post, .entry',
            title: 'h1, h2, .title',
            content: 'p, .content, .description',
            author: '.author, [rel="author"]',
            date: 'time, .date'
        };
    }
}
