import * as cheerio from 'cheerio';
import { GenericWebParser } from './base.parser';
import { ScrapedMention, ScraperConfig } from '../types/scraping.types';

export class ReviewParser extends GenericWebParser {
    override parse(html: string, config: ScraperConfig): ScrapedMention[] {
        const $ = this.loadHtml(html);
        const results: ScrapedMention[] = [];
        const selectors = config.selectors;

        $(selectors.container).each((_, element) => {
            const el = $(element);

            const title = this.cleanText(el.find(selectors.title).text());
            const content = this.cleanText(el.find(selectors.content).text());
            const author = this.cleanText(el.find(selectors.author).text()) || 'Anonymous';
            const dateStr = el.find(selectors.date).attr('datetime') || el.find(selectors.date).text();
            const relativeUrl = el.find(selectors.link || selectors.title).attr('href');

            // Review specific: rating
            const rating = this.extractRating(el);

            if (!content) return;

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
                engagementCount: rating, // We can store rating here or in rawData
                rawData: {
                    originalDate: dateStr,
                    rating: rating
                }
            });
        });

        return results;
    }

    private extractRating(el: any): number | undefined {
        // Common review rating patterns
        const ratingText = el.find('[aria-label*="rating"], [class*="rating"], [class*="star"]').text()
            || el.find('[aria-label*="rating"], [class*="rating"], [class*="star"]').attr('aria-label');

        if (ratingText) {
            const match = ratingText.match(/(\d+(\.\d+)?)/);
            return match ? parseFloat(match[1]) : undefined;
        }
        return undefined;
    }
}
