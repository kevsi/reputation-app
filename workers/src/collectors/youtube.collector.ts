/**
 * 📺 YouTube Collector - ENHANCED
 *
 * Collecte les vidéos et commentaires YouTube via YouTube Data API v3
 * Améliorations:
 * - API officielle (plus fiable que scraping HTML)
 * - Collecte des vidéos avec infos complètes
 * - Collecte des commentaires (incluant réponses)
 * - Pagination avec nextPageToken
 * - Gestion des quotas d'unités API
 */

import { BaseCollector } from './base.collector';
import axios, { AxiosInstance } from 'axios';
import { validateSourceCredentials } from '../config/free-sources.config';

export class YouTubeCollector extends BaseCollector {
  private client: AxiosInstance;
  private apiKey: string;
  private quotaUsed: number = 0;
  private dailyQuota: number = 10000; // Free tier quota

  constructor() {
    super();

    if (!validateSourceCredentials('YOUTUBE')) {
      throw new Error(
        `❌ YOUTUBE_API_KEY is not configured in .env file.\n` +
        `   Setup at: https://console.cloud.google.com\n` +
        `   Enable: YouTube Data API v3\n` +
        `   Add to .env: YOUTUBE_API_KEY=your_api_key_here`
      );
    }

    this.apiKey = process.env.YOUTUBE_API_KEY!;

    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      timeout: 30000,
      params: {
        key: this.apiKey,
      },
    });

    this.client.interceptors.request.use(config => {
      console.log(`   📡 YouTube: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      response => {
        // Track quota usage (most searches cost 100 units)
        this.quotaUsed += 100;
        return response;
      },
      error => {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.error?.message || 'Unknown error';
          console.error(`   ❌ YouTube Error ${status}: ${msg}`);
        }
        throw error;
      }
    );
  }

  async collect(source: any): Promise<any[]> {
    const keywords = this.extractKeywords(source);
    console.log(`📺 Searching YouTube for: ${keywords.join(', ')}`);
    console.log(`   📊 Quota remaining: ${this.dailyQuota - this.quotaUsed} units`);

    try {
      const mentions: any[] = [];

      // Rechercher des vidéos
      const videos = await this.searchVideos(keywords, source.config || {});
      mentions.push(...this.transformVideos(videos, source));

      // Collecte les commentaires des meilleures vidéos
      if (source.config?.includeComments && videos.length > 0) {
        const topVideos = videos.slice(0, 3); // Limiter à 3 pour ne pas dépasser le quota
        
        for (const video of topVideos) {
          try {
            const comments = await this.getVideoComments(video.id.videoId, source.config);
            mentions.push(...this.transformComments(comments, source, video.id.videoId));
          } catch (error) {
            console.warn(`   ⚠️  Failed to fetch comments for video ${video.id.videoId}`);
          }
        }
      }

      console.log(`   📊 Found ${mentions.length} YouTube items`);
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

  private async searchVideos(keywords: string[], config: any): Promise<any[]> {
    try {
      const query = keywords.join(' ');

      const response = await this.client.get('/search', {
        params: {
          q: query,
          type: 'video',
          part: 'snippet',
          order: config.order || 'relevance',
          maxResults: Math.min(config.maxResults || 25, 50),
          videoCategoryId: config.videoCategoryId, // optional
          regionCode: config.regionCode || 'US',
          relevanceLanguage: config.language || 'en',
          pageToken: config.pageToken,
        },
      });

      if (response.data?.items) {
        return response.data.items;
      }

      return [];
    } catch (error) {
      console.error('   ❌ Error searching YouTube videos:', error);
      return [];
    }
  }

  private async getVideoComments(videoId: string, config: any): Promise<any[]> {
    try {
      const response = await this.client.get('/commentThreads', {
        params: {
          videoId,
          part: 'snippet,replies',
          textFormat: 'plainText',
          maxResults: Math.min(config.maxComments || 20, 100),
          order: config.commentOrder || 'relevance',
        },
      });

      if (response.data?.items) {
        const comments: any[] = [];

        // Ajouter les commentaires principaux
        for (const thread of response.data.items) {
          comments.push(thread.snippet.topLevelComment.snippet);

          // Ajouter les réponses (replies)
          if (thread.replies?.comments) {
            for (const reply of thread.replies.comments) {
              comments.push({
                ...reply.snippet,
                isReply: true,
                parentAuthor: thread.snippet.topLevelComment.snippet.authorDisplayName,
              });
            }
          }
        }

        return comments;
      }

      return [];
    } catch (error) {
      console.error(`   ❌ Error fetching comments for video ${videoId}:`, error);
      return [];
    }
  }

  private transformVideos(videos: any[], source: any): any[] {
    return videos.map(video => ({
      externalId: `youtube-${video.id.videoId}`,
      sourceId: source.id,

      content: video.snippet.description || '',
      title: video.snippet.title,

      author: video.snippet.channelTitle,
      authorId: video.snippet.channelId,

      rating: null,
      sentiment: this.analyzeSentiment(video.snippet.title, video.snippet.description),

      publishedAt: new Date(video.snippet.publishedAt),
      collectedAt: new Date(),

      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,

      metadata: {
        platform: 'youtube',
        type: 'video',
        videoId: video.id.videoId,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        thumbnailUrl: video.snippet.thumbnails?.high?.url,
        description: video.snippet.description,
      },
    }));
  }

  private transformComments(comments: any[], source: any, videoId: string): any[] {
    return comments.map((comment, idx) => ({
      externalId: `youtube-comment-${videoId}-${idx}`,
      sourceId: source.id,

      content: comment.textDisplay,
      title: `Comment on: ${comment.videoId ? 'video' : 'N/A'}`,

      author: comment.authorDisplayName,
      authorId: comment.authorChannelId?.value,

      rating: null,
      sentiment: this.analyzeSentiment(comment.textDisplay),

      publishedAt: new Date(comment.publishedAt),
      collectedAt: new Date(),

      url: `https://www.youtube.com/watch?v=${videoId}&t=0s`,

      metadata: {
        platform: 'youtube',
        type: 'comment',
        videoId,
        authorChannelUrl: comment.authorChannelUrl,
        authorProfileImageUrl: comment.authorProfileImageUrl,
        likeCount: comment.likeCount,
        isReply: comment.isReply || false,
        parentAuthor: comment.parentAuthor || null,
      },
    }));
  }

  private analyzeSentiment(title: string = '', description: string = ''): string {
    const text = `${title} ${description}`.toLowerCase();

    const positiveWords = ['great', 'amazing', 'love', 'awesome', 'excellent', 'good', 'best', 'recommend', 'fantastic'];
    const negativeWords = ['hate', 'awful', 'terrible', 'bad', 'worst', 'horrible', 'don\'t like', 'disappointing'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  private handleError(error: any): void {
    const status = error.response?.status;

    if (status === 400) {
      console.error(`   ❌ Bad request. Check your parameters.`);
    } else if (status === 403) {
      console.error(`   ❌ Access denied. Check API key and YouTube Data API v3 is enabled.`);
    } else if (status === 429) {
      console.error(`   ❌ Rate limit exceeded. Daily quota exhausted.`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.client.get('/search', {
        params: {
          q: 'test',
          type: 'video',
          part: 'snippet',
          maxResults: 1,
        },
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
      message: isValid ? 'YouTube API credentials are valid' : 'YouTube API credentials are invalid'
    };
  }
}