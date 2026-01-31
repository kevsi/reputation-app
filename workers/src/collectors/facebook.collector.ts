/**
 * 📘 Facebook Collector
 *
 * Collecte les posts Facebook pour une page donnée
 */

import { BaseCollector, RawMention, CollectorConfig } from './base.collector';
import { Source, SourceType } from '@sentinelle/database';

export interface FacebookConfig extends CollectorConfig {
  pageId?: string;      // ex: "Nike"
  pageUrl?: string;     // ex: "https://www.facebook.com/nike"
  searchQuery?: string; // terme de recherche
}

export class FacebookCollector extends BaseCollector {

  async collect(source: Source, keywords: string[]): Promise<RawMention[]> {
    console.log(`📘 Scraping Facebook for brand: ${source.name}`);

    const config = source.config as FacebookConfig;
    const mentions: RawMention[] = [];

    try {
      // Facebook search: https://www.facebook.com/search/posts/?q=nike
      const searchTerm = config.searchQuery || keywords.join(' ') || source.name;
      const searchUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(searchTerm)}`;

      const html = await this.fetchHtml(searchUrl);
      const $ = this.loadCheerio(html);

      // Note: Facebook utilise beaucoup de JavaScript, donc le scraping HTML simple
      // peut ne pas fonctionner parfaitement. Pour production, utiliser Facebook Graph API

      // Sélecteurs Facebook (très susceptibles de changer)
      $('[data-testid="post_container"]').each((i, element) => {
        try {
          const postText = $(element).find('[data-testid="post_message"]').text().trim() ||
                          $(element).find('.userContent').text().trim() ||
                          $(element).find('p').first().text().trim();

          const author = $(element).find('[data-testid="post_author_link"]').text().trim() ||
                        $(element).find('.fwb a').text().trim() ||
                        'Unknown User';

          const postUrl = $(element).find('a[href*="/posts/"]').attr('href') ||
                         $(element).find('[data-testid="post_timestamp"]').attr('href');

          const timestamp = $(element).find('time').attr('datetime') ||
                           $(element).find('[data-testid="post_timestamp"]').attr('title');

          const reactions = $(element).find('[aria-label*="reaction"]').text().trim();

          if (postText && postUrl) {
            // Vérifier si le texte contient un des mots-clés
            const hasKeyword = keywords.length === 0 ||
                              keywords.some(kw =>
                                postText.toLowerCase().includes(kw.toLowerCase())
                              );

            if (hasKeyword) {
              // Générer un ID unique basé sur l'URL
              const postId = postUrl.includes('/posts/') ?
                            postUrl.split('/posts/')[1].split('/')[0] :
                            `fb_${Date.now()}_${i}`;

              mentions.push({
                text: postText,
                author: author,
                authorUrl: author.includes('facebook.com') ? author : undefined,
                url: postUrl.startsWith('http') ? postUrl : `https://facebook.com${postUrl}`,
                publishedAt: timestamp ? new Date(timestamp) : new Date(),
                externalId: postId,
                platform: 'FACEBOOK' as SourceType,
                engagementCount: this.parseReactions(reactions),
                rawData: {
                  reactions: this.parseReactions(reactions)
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing Facebook post:', error);
        }
      });

      console.log(`📘 Collected ${mentions.length} Facebook mentions for ${source.name}`);

    } catch (error) {
      console.error(`📘 Error scraping Facebook for ${source.name}:`, error);
    }

    return mentions;
  }

  async testConnection(config: FacebookConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Test avec une recherche simple
      const testUrl = 'https://www.facebook.com/search/posts/?q=test';
      const html = await this.fetchHtml(testUrl);

      if (html.includes('facebook.com')) {
        return { success: true, message: 'Facebook connection successful' };
      } else {
        return { success: false, message: 'Facebook page structure changed or login required' };
      }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  private parseReactions(reactionStr: string): number {
    if (!reactionStr) return 0;

    // Facebook reactions are like "12 reactions" or "1.2K reactions"
    const match = reactionStr.match(/(\d+(?:\.\d+)?)(K|M)?/);
    if (match) {
      const num = parseFloat(match[1]);
      const multiplier = match[2] === 'K' ? 1000 : match[2] === 'M' ? 1000000 : 1;
      return Math.floor(num * multiplier);
    }

    return 0;
  }
}