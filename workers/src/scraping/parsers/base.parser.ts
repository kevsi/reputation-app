import * as cheerio from 'cheerio';
import { ScrapedMention, SelectorConfig, ScraperConfig } from '../types/scraping.types';
import { SourceType } from '@sentinelle/database';

export abstract class BaseParser {
    protected loadHtml(html: string): cheerio.CheerioAPI {
        return cheerio.load(html);
    }

    abstract parse(html: string, config: ScraperConfig): ScrapedMention[];

    protected cleanText(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }

    protected extractExternalId(url: string): string {
        // Generate a simple hash or use the URL as ID if no specific ID is found
        return Buffer.from(url).toString('base64').substring(0, 32);
    }
}

export class GenericWebParser extends BaseParser {
    parse(html: string, config: ScraperConfig): ScrapedMention[] {
        const $ = this.loadHtml(html);
        const results: ScrapedMention[] = [];
        const selectors = config.selectors;

        // Valider que les sélecteurs essentiels existent
        if (!selectors?.container) {
            console.warn(`⚠️ No container selector provided for ${config.name}, using defaults`);
            selectors.container = 'article, .post, .entry';
        }

        $(selectors.container).each((_, element) => {
            try {
                const el = $(element);

                const title = this.cleanText(el.find(selectors.title || 'h1, h2').text());
                const content = this.cleanText(el.find(selectors.content || 'p').text());
                const author = this.cleanText(el.find(selectors.author || '.author').text()) || 'Anonymous';
                const dateStr = el.find(selectors.date || 'time').attr('datetime') ||
                    el.find(selectors.date || 'time').text();
                const relativeUrl = el.find(selectors.link || selectors.title || 'a').attr('href');

                if (!content) return; // Skip if no content

                const absoluteUrl = relativeUrl ? new URL(relativeUrl, config.url).toString() : config.url;

                results.push({
                    title,
                    content,
                    author,
                    publishedAt: dateStr ? new Date(dateStr) : new Date(),
                    url: absoluteUrl,
                    source: config.name,
                    platform: config.type,
                    externalId: this.extractExternalId(absoluteUrl),
                    rawData: {
                        originalDate: dateStr,
                        selectors: selectors // Log sélecteurs utilisés
                    }
                });
            } catch (itemError) {
                console.warn(`⚠️ Error parsing individual item in ${config.name}:`, itemError);
                // Continue avec prochain item
            }
        });

        return results;
    }
}
