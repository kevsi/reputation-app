"use strict";
/**
 * 🏆 Trustpilot Collector
 *
 * Collecte les avis Trustpilot pour une marque donnée
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustpilotCollector = void 0;
const base_collector_1 = require("./base.collector");
class TrustpilotCollector extends base_collector_1.BaseCollector {
    async collect(source, keywords) {
        console.log(`🏆 Scraping Trustpilot for brand: ${source.type}`);
        const config = source.config;
        const companyName = config.companyName || source.name;
        const mentions = [];
        try {
            // Trustpilot: https://www.trustpilot.com/review/amazon.com
            const searchUrl = `https://www.trustpilot.com/review/${companyName}`;
            const html = await this.fetchHtml(searchUrl);
            const $ = this.loadCheerio(html);
            // Récupérer tous les avis
            const reviews = [];
            // Sélecteurs Trustpilot (peut changer - à adapter si changement du DOM)
            $('[data-review-id]').each((i, element) => {
                try {
                    const reviewId = $(element).attr('data-review-id');
                    const text = $(element).find('.review-content-header__body').text().trim() ||
                        $(element).find('p').first().text().trim();
                    const author = $(element).find('.consumer-info__name').text().trim() || 'Anonymous';
                    const ratingStr = $(element).find('.star-rating').attr('data-rating') || '3';
                    const dateStr = $(element).find('time').attr('datetime') || new Date().toISOString();
                    if (text && reviewId) {
                        // Vérifier si le texte contient un des mots-clés (optionnel)
                        const hasKeyword = keywords.length === 0 ||
                            keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
                        if (hasKeyword) {
                            reviews.push({
                                text,
                                author,
                                url: searchUrl + '#' + reviewId,
                                publishedAt: new Date(dateStr),
                                externalId: reviewId,
                                platform: 'TRUSTPILOT',
                                engagementCount: 0,
                                rawData: {
                                    rating: parseInt(ratingStr),
                                    source: 'trustpilot'
                                }
                            });
                        }
                    }
                }
                catch (e) {
                    console.warn(`Error parsing review element:`, e);
                }
            });
            mentions.push(...reviews);
            console.log(`✅ Found ${reviews.length} reviews on Trustpilot`);
        }
        catch (error) {
            console.error(`❌ Trustpilot scraping failed:`, error);
            throw error;
        }
        return mentions;
    }
    async validateCredentials(config) {
        try {
            const trustConfig = config;
            if (!trustConfig.companyName) {
                return false;
            }
            const result = await this.testConnection(config);
            return result.success;
        }
        catch (error) {
            console.error('Trustpilot validation failed:', error);
            return false;
        }
    }
    async testConnection(config) {
        try {
            const trustConfig = config;
            const companyName = trustConfig.companyName;
            if (!companyName) {
                return {
                    success: false,
                    message: 'Company name is required'
                };
            }
            const searchUrl = `https://www.trustpilot.com/review/${companyName}`;
            const html = await this.fetchHtml(searchUrl);
            // Vérifier que la page contient un élément de review
            if (html.includes('review-content') || html.includes('[data-review-id]')) {
                return {
                    success: true,
                    message: `Successfully connected to Trustpilot for ${companyName}`
                };
            }
            return {
                success: false,
                message: `No reviews found for ${companyName}`
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
exports.TrustpilotCollector = TrustpilotCollector;
