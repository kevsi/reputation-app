/**
 * 🐦 Twitter Collector
 *
 * Collecte les mentions depuis Twitter API v2
 */

import { TwitterApi } from 'twitter-api-v2';
import { ICollector, RawMention } from './base.collector';
import { Source } from '@sentinelle/database';

interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  bearerToken: string;
  accessToken?: string;
  accessTokenSecret?: string;
  scrapingFrequency: string;
}

export class TwitterCollector implements ICollector {

  async collect(source: Source, keywords: string[]): Promise<RawMention[]> {
    const config = source.config as unknown as TwitterConfig;
    const client = new TwitterApi(config.bearerToken);

    const mentions: RawMention[] = [];

    // Pour chaque mot-clé, faire une recherche Twitter
    for (const keyword of keywords) {

      // Construire la query Twitter
      // Si le mot-clé contient #, @ ou des espaces, l'utiliser tel quel
      // Sinon, rechercher le mot partout dans le tweet
      const query = keyword;

      try {
        const tweets = await client.v2.search(query, {
          max_results: 100,  // Twitter limite à 100 par requête
          'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
          'user.fields': ['username']
        });

        // Transformer chaque tweet en RawMention
        const tweetData = Array.isArray(tweets.data) ? tweets.data : tweets.data ? [tweets.data] : [];
        for (const tweet of tweetData) {
          mentions.push({
            text: tweet.text,
            author: `@${tweet.author?.username || tweet.author_id || 'unknown'}`,
            url: `https://twitter.com/user/status/${tweet.id}`,
            publishedAt: new Date(tweet.created_at || Date.now()),
            externalId: tweet.id,
            platform: 'TWITTER',
            engagementCount: tweet.public_metrics?.like_count || 0,
            rawData: tweet
          });
        }

      } catch (error) {
        console.error(`Erreur lors de la recherche du mot-clé "${keyword}":`, error);
        // Continuer avec les autres mots-clés
      }
    }

    return mentions;
  }

  async validateCredentials(config: TwitterConfig): Promise<boolean> {
    try {
      const client = new TwitterApi(config.bearerToken);
      await client.v2.me();  // Test simple : récupérer infos utilisateur
      return true;
    } catch (error) {
      console.error('Twitter credentials validation failed:', error);
      return false;
    }
  }

  async testConnection(config: TwitterConfig): Promise<{ success: boolean; message: string }> {
    try {
      const client = new TwitterApi(config.bearerToken);
      const user = await client.v2.me();
      return {
        success: true,
        message: `Connected as @${user.data.username}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}