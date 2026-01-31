/**
 * 📰 News Collector
 * 
 * Collecte d'articles de presse via NewsAPI.org
 * API: NewsAPI.org
 * Quota: 100 requêtes/jour GRATUIT (articles des 30 derniers jours)
 * Documentation: https://newsapi.org/docs
 * 
 * Configuration requise dans source.config:
 * - keywords: Array de mots-clés à rechercher
 * - language: Code langue (default: 'en')
 */

import { BaseCollector } from './base.collector';
import axios, { AxiosInstance } from 'axios';
import { validateSourceCredentials } from '../config/free-sources.config';

export class NewsCollector extends BaseCollector {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    super();
    
    if (!validateSourceCredentials('NEWS_API')) {
      throw new Error(
        `❌ NEWS_API_KEY is not configured in .env file.\n` +
        `   Sign up at: https://newsapi.org/register\n` +
        `   Add to .env: NEWS_API_KEY=your_api_key_here`
      );
    }

    this.apiKey = process.env.NEWS_API_KEY!;

    this.client = axios.create({
      baseURL: 'https://newsapi.org/v2',
      timeout: 30000,
      headers: {
        'X-Api-Key': this.apiKey,
      },
    });

    this.client.interceptors.request.use(config => {
      console.log(`   📡 NewsAPI: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.message || 'Unknown error';
          console.error(`   ❌ NewsAPI Error ${status}: ${msg}`);
        }
        throw error;
      }
    );
  }

  async collect(source: any): Promise<any[]> {
    const keywords = this.extractKeywords(source);
    console.log(`📰 Searching news for: ${keywords.join(', ')}`);

    try {
      const articles = await this.searchArticles(keywords, source.config || {});
      console.log(`   📊 Found ${articles.length} news articles`);
      
      return this.transformArticles(articles, source);
      
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  private extractKeywords(source: any): string[] {
    const keywords = source.config?.keywords || source.config?.searchTerms || [];

    if (keywords.length === 0) {
      throw new Error(
        `❌ No keywords configured for source ${source.id}.\n` +
        `   Add "keywords" array in source.config`
      );
    }

    return keywords;
  }

  private async searchArticles(keywords: string[], config: any): Promise<any[]> {
    const query = keywords.join(' OR ');
    
    const params: any = {
      q: query,
      language: config.language || 'en',
      sortBy: config.sortBy || 'publishedAt',
      pageSize: Math.min(config.pageSize || 100, 100),
    };

    if (config.from) {
      params.from = config.from;
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.from = thirtyDaysAgo.toISOString();
    }

    if (config.to) {
      params.to = config.to;
    }

    if (config.sources && config.sources.length > 0) {
      params.sources = config.sources.join(',');
    }

    const response = await this.client.get('/everything', { params });
    return response.data.articles || [];
  }

  private transformArticles(articles: any[], source: any): any[] {
    return articles.map(article => ({
      externalId: this.generateArticleId(article.url),
      sourceId: source.id,
      
      content: this.buildArticleContent(article),
      title: article.title,
      
      author: article.author || article.source?.name || 'Unknown',
      authorId: null,
      
      rating: null,
      sentiment: this.analyzeSentiment(article.title, article.description),
      
      publishedAt: new Date(article.publishedAt),
      collectedAt: new Date(),
      
      url: article.url,
      
      metadata: {
        platform: 'news',
        newsSource: article.source?.name,
        sourceDomain: this.extractDomain(article.url),
        description: article.description,
        imageUrl: article.urlToImage,
      },
    }));
  }

  private buildArticleContent(article: any): string {
    const parts: string[] = [];
    
    if (article.title) parts.push(article.title);
    if (article.description) parts.push(article.description);
    if (article.content) parts.push(article.content);
    
    return parts.join('\n\n').trim();
  }

  private analyzeSentiment(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    const positiveWords = ['success', 'win', 'growth', 'profit', 'gain', 'rise', 'up', 'good', 'great', 'excellent', 'positive'];
    const negativeWords = ['fail', 'loss', 'decline', 'fall', 'drop', 'down', 'crisis', 'bad', 'poor', 'negative'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  private generateArticleId(url: string): string {
    return `news-${Buffer.from(url).toString('base64').substring(0, 32)}`;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  private handleError(error: any): void {
    const status = error.response?.status;
    
    if (status === 400) {
      console.error(`   ❌ NewsAPI bad request. Check your query parameters.`);
    } else if (status === 401) {
      console.error(`   ❌ NewsAPI authentication failed. Check NEWS_API_KEY.`);
    } else if (status === 429) {
      console.error(`   ❌ NewsAPI rate limit exceeded (100/day).`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.client.get('/everything', { params: { q: 'test', pageSize: 1 } });
      return true;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.client.get('/everything', { params: { q: 'test', pageSize: 1 } });
      return {
        success: true,
        message: 'NewsAPI connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `NewsAPI connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
