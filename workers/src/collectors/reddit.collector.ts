/**
 * 🟠 Reddit Collector - ENHANCED
 *
 * Collecte les posts Reddit pour une marque donnée
 * Améliorations:
 * - Support des commentaires (pas seulement posts)
 * - Métriques d'engagement (upvotes, awards, comments)
 * - User-Agent requis (compliance Reddit)
 * - JSON API (plus fiable que scraping HTML)
 * - Analyse de sentiment basée sur le contenu
 */

import { BaseCollector } from './base.collector';
import axios, { AxiosInstance } from 'axios';

export class RedditCollector extends BaseCollector {
  private client: AxiosInstance;

  constructor() {
    super();

    this.client = axios.create({
      baseURL: 'https://www.reddit.com',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Sentinelle/1.0',
      },
    });

    this.client.interceptors.request.use(config => {
      console.log(`   📡 Reddit: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const status = error.response.status;
          console.error(`   ❌ Reddit Error ${status}: ${error.message}`);
        }
        throw error;
      }
    );
  }

  async collect(source: any): Promise<any[]> {
    const keywords = this.extractKeywords(source);
    console.log(`🟠 Searching Reddit for: ${keywords.join(', ')}`);

    try {
      const mentions: any[] = [];

      // Récupérer posts
      const posts = await this.searchPosts(keywords, source.config || {});
      mentions.push(...this.transformPosts(posts, source));

      // Récupérer commentaires pertinents
      if (source.config?.includeComments) {
        const comments = await this.searchComments(keywords, source.config);
        mentions.push(...this.transformComments(comments, source));
      }

      console.log(`   📊 Found ${mentions.length} Reddit mentions`);
      return mentions;

    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  private extractKeywords(source: any): string[] {
    const keywords = source.config?.keywords || source.config?.searchTerms || [source.name];
    return keywords;
  }

  private async searchPosts(keywords: string[], config: any): Promise<any[]> {
    try {
      const query = keywords.join(' OR ');
      const subreddit = config.subreddit || 'all';
      const timeframe = config.timeframe || 'month';
      const sort = config.sort || 'new';

      const url = `/${subreddit}/search/.json`;
      const params: any = {
        q: query,
        t: timeframe,
        sort,
        limit: Math.min(config.limit || 50, 100),
        restrict_sr: config.subreddit ? true : false,
      };

      const response = await this.client.get(url, { params });

      if (response.data?.data?.children) {
        return response.data.data.children
          .map((item: any) => item.data)
          .filter((post: any) => post && post.title);
      }

      return [];
    } catch (error) {
      console.error('   ❌ Error searching Reddit posts:', error);
      return [];
    }
  }

  private async searchComments(keywords: string[], config: any): Promise<any[]> {
    try {
      // Note: Reddit's comment search is limited
      // Cette fonction récupère les meilleurs commentaires des posts trouvés
      const comments: any[] = [];

      if (!config.subreddit) return comments;

      const query = keywords.join(' OR ');
      const url = `/${config.subreddit}/search/.json`;

      const response = await this.client.get(url, {
        params: {
          q: query,
          t: 'month',
          sort: 'new',
          limit: 10,
          restrict_sr: true,
        },
      });

      // Pour chaque post, récupérer les top commentaires
      if (response.data?.data?.children) {
        for (const post of response.data.data.children.slice(0, 5)) {
          const postData = post.data;
          if (postData.id) {
            try {
              const commentsUrl = `/${config.subreddit}/comments/${postData.id}/.json`;
              const commentsResponse = await this.client.get(commentsUrl, {
                params: { limit: 10, sort: 'top' },
              });

              if (commentsResponse.data?.[1]?.data?.children) {
                comments.push(
                  ...commentsResponse.data[1].data.children
                    .map((c: any) => ({
                      ...c.data,
                      postTitle: postData.title,
                      postId: postData.id,
                    }))
                    .filter((c: any) => c.body && c.body !== '[deleted]' && c.body !== '[removed]')
                );
              }
            } catch (error) {
              // Ignore individual post comment failures
            }
          }
        }
      }

      return comments;
    } catch (error) {
      console.error('   ❌ Error searching Reddit comments:', error);
      return [];
    }
  }

  private transformPosts(posts: any[], source: any): any[] {
    return posts.map(post => ({
      externalId: `reddit-post-${post.id}`,
      sourceId: source.id,

      content: post.title,
      title: post.title.substring(0, 100),

      author: post.author || '[deleted]',
      authorId: post.author_fullname,

      rating: null,
      sentiment: this.analyzeSentiment(post.title),

      publishedAt: new Date(post.created_utc * 1000),
      collectedAt: new Date(),

      url: `https://reddit.com${post.permalink}`,

      metadata: {
        platform: 'reddit',
        type: 'post',
        subreddit: post.subreddit,
        upvotes: post.ups,
        downvotes: post.downs,
        score: post.score,
        commentCount: post.num_comments,
        awards: post.total_awards_received,
        isEdited: post.edited !== false,
        crosspost: post.crosspost_parent ? true : false,
      },
    }));
  }

  private transformComments(comments: any[], source: any): any[] {
    return comments.map(comment => ({
      externalId: `reddit-comment-${comment.id}`,
      sourceId: source.id,

      content: comment.body,
      title: comment.postTitle?.substring(0, 100) || 'Comment',

      author: comment.author || '[deleted]',
      authorId: comment.author_fullname,

      rating: null,
      sentiment: this.analyzeSentiment(comment.body),

      publishedAt: new Date(comment.created_utc * 1000),
      collectedAt: new Date(),

      url: `https://reddit.com${comment.permalink || '/'}`,

      metadata: {
        platform: 'reddit',
        type: 'comment',
        subreddit: comment.subreddit,
        postId: comment.postId,
        upvotes: comment.ups,
        downvotes: comment.downs,
        score: comment.score,
        awards: comment.total_awards_received,
        parentComment: comment.parent_id?.startsWith('t1_') ? true : false,
      },
    }));
  }

  private analyzeSentiment(text: string): string {
    const lowerText = text.toLowerCase();

    const positiveWords = ['great', 'amazing', 'love', 'awesome', 'excellent', 'good', 'best', 'perfect', 'nice', 'brilliant', 'fantastic'];
    const negativeWords = ['hate', 'awful', 'terrible', 'bad', 'worst', 'horrible', 'poor', 'sucks', 'garbage', 'useless'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  private handleError(error: any): void {
    const status = error.response?.status;

    if (status === 429) {
      console.error(`   ❌ Reddit rate limit exceeded. Wait before next request.`);
    } else if (status === 403) {
      console.error(`   ❌ Reddit access denied. Check User-Agent and credentials.`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.client.get('/search.json', {
        params: { q: 'test', limit: 1 },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const isValid = await this.validateCredentials();
    return {
      success: isValid,
      message: isValid ? 'Reddit API credentials are valid' : 'Reddit API credentials are invalid'
    };
  }
}