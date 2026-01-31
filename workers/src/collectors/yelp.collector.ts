/**
 * 🍽️ Yelp Collector
 * 
 * Collecte d'avis Yelp via API officielle
 * API: Yelp Fusion API v3
 * Quota: 5,000 requêtes/jour GRATUIT
 * Documentation: https://www.yelp.com/developers/documentation/v3
 * 
 * Configuration requise dans source.config:
 * - yelpBusinessId: ID du business Yelp (ex: "gary-danko-san-francisco")
 */

import { BaseCollector } from './base.collector';
import axios, { AxiosInstance } from 'axios';
import { validateSourceCredentials } from '../config/free-sources.config';

export class YelpCollector extends BaseCollector {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    super();
    
    if (!validateSourceCredentials('YELP')) {
      throw new Error(
        `❌ YELP_API_KEY is not configured in .env file.\n` +
        `   Get your API key at: https://www.yelp.com/developers/v3/manage_app\n` +
        `   Add to .env: YELP_API_KEY=your_api_key_here`
      );
    }

    this.apiKey = process.env.YELP_API_KEY!;

    this.client = axios.create({
      baseURL: 'https://api.yelp.com/v3',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(config => {
      console.log(`   📡 Yelp API: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.error?.description || 'Unknown error';
          console.error(`   ❌ Yelp API Error ${status}: ${msg}`);
        }
        throw error;
      }
    );
  }

  async collect(source: any): Promise<any[]> {
    const businessId = this.extractBusinessId(source);
    console.log(`🍽️  Collecting Yelp reviews for: ${businessId}`);

    try {
      const businessInfo = await this.getBusinessInfo(businessId);
      console.log(`   📍 Business: ${businessInfo.name}`);
      console.log(`   ⭐ Rating: ${businessInfo.rating} (${businessInfo.review_count} reviews)`);

      const reviews = await this.getBusinessReviews(businessId);
      console.log(`   📊 Collected ${reviews.length} reviews`);
      
      return this.transformReviews(reviews, source, businessInfo);
      
    } catch (error: any) {
      this.handleError(error, businessId);
      throw error;
    }
  }

  private extractBusinessId(source: any): string {
    const businessId = source.config?.yelpBusinessId || source.config?.businessId;

    if (!businessId) {
      throw new Error(
        `❌ Yelp business ID not found for source ${source.id}.\n` +
        `   Add "yelpBusinessId" in source.config`
      );
    }

    return businessId;
  }

  private async getBusinessInfo(businessId: string): Promise<any> {
    const response = await this.client.get(`/businesses/${businessId}`);
    return response.data;
  }

  private async getBusinessReviews(businessId: string): Promise<any[]> {
    const response = await this.client.get(`/businesses/${businessId}/reviews`, {
      params: {
        limit: 50,
        sort_by: 'newest',
      }
    });

    return response.data.reviews || [];
  }

  private transformReviews(reviews: any[], source: any, businessInfo: any): any[] {
    return reviews.map(review => ({
      externalId: review.id,
      sourceId: source.id,
      
      content: review.text,
      title: null,
      author: review.user?.name || 'Anonymous',
      authorId: review.user?.id || null,
      authorImageUrl: review.user?.image_url || null,
      
      rating: review.rating,
      sentiment: this.getSentimentFromRating(review.rating),
      
      publishedAt: new Date(review.time_created),
      collectedAt: new Date(),
      
      url: review.url,
      
      metadata: {
        platform: 'yelp',
        businessName: businessInfo.name,
        businessRating: businessInfo.rating,
        businessReviewCount: businessInfo.review_count,
        businessPhone: businessInfo.phone,
        businessUrl: businessInfo.url,
      },
    }));
  }

  private getSentimentFromRating(rating: number): string {
    if (rating >= 4) return 'POSITIVE';
    if (rating === 3) return 'NEUTRAL';
    return 'NEGATIVE';
  }

  private handleError(error: any, businessId: string): void {
    const status = error.response?.status;
    
    if (status === 400) {
      console.error(`   ❌ Invalid Yelp business ID: ${businessId}`);
    } else if (status === 401) {
      console.error(`   ❌ Yelp authentication failed. Check YELP_API_KEY.`);
    } else if (status === 404) {
      console.error(`   ❌ Yelp business not found: ${businessId}`);
    } else if (status === 429) {
      console.error(`   ❌ Yelp rate limit exceeded (5,000/day).`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.client.get('/businesses/google-san-francisco');
      return true;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.client.get('/businesses/google-san-francisco');
      return {
        success: true,
        message: 'Yelp API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Yelp API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
