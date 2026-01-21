import { BaseCollector } from './base.collector';

export class TrustpilotCollector extends BaseCollector {
    async collect(url: string): Promise<any[]> {
        console.log(`🕵️ Scraping Trustpilot: ${url}`);

        try {
            const html = await this.fetchHtml(url);
            const $ = this.loadCheerio(html);
            const mentions: any[] = [];

            // This is a simplified example of how we would parse Trustpilot reviews
            // In a real scenario, we'd need to handle pagination and more complex selectors
            $('.styles_reviewCardInner__907_e').each((i, element) => {
                const content = $(element).find('.styles_reviewContent__1vH7f').text().trim();
                const author = $(element).find('.styles_consumerName__4_Ska').text().trim();
                const dateStr = $(element).find('time').attr('datetime');
                const rating = $(element).find('.styles_reviewHeader__iU91u').attr('data-user-review-rating');

                if (content) {
                    mentions.push({
                        content,
                        author,
                        publishedAt: dateStr ? new Date(dateStr) : new Date(),
                        platformSentiment: this.mapRatingToSentiment(rating),
                        rawData: { rating, originalDate: dateStr }
                    });
                }
            });

            // If we couldn't find anything with selectors (e.g. anti-bot or changed layout),
            // we return a fallback or empty array.
            return mentions;
        } catch (error) {
            console.error(`❌ Trustpilot scraping failed for ${url}:`, error);
            return [];
        }
    }

    private mapRatingToSentiment(rating?: string): string {
        const r = parseInt(rating || '0');
        if (r >= 4) return 'POSITIVE';
        if (r <= 2) return 'NEGATIVE';
        return 'NEUTRAL';
    }
}
