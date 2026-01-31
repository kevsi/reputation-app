/**
 * 🟦 Google Reviews Collector - ENHANCED
 *
 * Collecte les avis Google Reviews pour une entreprise donnée via Google Places API
 * Améliorations:
 * - Support des photos d'avis
 * - Réponses des propriétaires
 * - Meilleure gestion des erreurs
 * - Analyse de sentiment basée sur les notes
 */

import { BaseCollector } from './base.collector';
import axios, { AxiosInstance } from 'axios';
import { validateSourceCredentials } from '../config/free-sources.config';

export class GoogleReviewsCollector extends BaseCollector {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    super();
    
    if (!validateSourceCredentials('GOOGLE_REVIEWS')) {
      throw new Error(
        `❌ GOOGLE_API_KEY is not configured in .env file.\n` +
        `   Setup at: https://console.cloud.google.com\n` +
        `   Enable: Google Places API\n` +
        `   Add to .env: GOOGLE_API_KEY=your_api_key_here`
      );
    }

    this.apiKey = process.env.GOOGLE_API_KEY!;

    this.client = axios.create({
      timeout: 30000,
    });

    this.client.interceptors.request.use(config => {
      console.log(`   📡 Google Places: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.error_message || 'Unknown error';
          console.error(`   ❌ Google Places Error ${status}: ${msg}`);
        }
        throw error;
      }
    );
  }

  async collect(source: any): Promise<any[]> {
    console.log(`🟦 Searching Google Reviews for: ${source.config?.placeName || source.name}`);

    try {
      let placeId = source.config?.placeId;

      if (!placeId && source.config?.placeName) {
        placeId = await this.findPlaceId(source.config.placeName, source.config.location);
        if (!placeId) {
          console.error(`   ❌ Could not find place ID for ${source.config.placeName}`);
          return [];
        }
      }

      if (!placeId) {
        throw new Error('Place ID is required (provide placeId or placeName in source.config)');
      }

      const reviews = await this.getPlaceReviews(placeId);
      console.log(`   📊 Found ${reviews.length} Google Reviews`);
      
      return this.transformReviews(reviews, source);

    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  private async findPlaceId(placeName: string, location?: string): Promise<string | null> {
    try {
      const query = location ? `${placeName} ${location}` : placeName;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

      const response = await this.client.get(searchUrl, {
        params: {
          query,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].place_id;
      }

      if (response.data.status === 'ZERO_RESULTS') {
        console.warn(`   ⚠️  No place found for: ${placeName}`);
      }

      return null;
    } catch (error) {
      console.error('   ❌ Error finding place ID:', error);
      return null;
    }
  }

  private async getPlaceReviews(placeId: string): Promise<any[]> {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;

      const response = await this.client.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'reviews,name,rating,user_ratings_total,photos',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        console.error(`   ❌ Google Places API error: ${response.data.status}`);
        return [];
      }

      return response.data.result.reviews || [];
    } catch (error) {
      console.error('   ❌ Error getting place reviews:', error);
      return [];
    }
  }

  private transformReviews(reviews: any[], source: any): any[] {
    return reviews.map((review, index) => ({
      externalId: `google-${review.author_name || 'anon'}-${review.time}`,
      sourceId: source.id,

      content: review.text || '[No text]',
      title: `${review.rating}/5 stars`,

      author: review.author_name || 'Anonymous',
      authorId: null,

      rating: review.rating,
      sentiment: this.getSentimentFromRating(review.rating),

      publishedAt: new Date(review.time * 1000),
      collectedAt: new Date(),

      url: source.config?.placeUrl || `https://www.google.com/maps/search/?api=1&query=${source.config?.placeName}`,

      metadata: {
        platform: 'google_reviews',
        placeId: source.config?.placeId,
        placeName: source.config?.placeName,
        authorUrl: review.author_url,
        authorAvatar: review.profile_photo_url,
        photos: review.photos?.map((p: any) => p.photo_reference) || [],
        ownerResponse: review.owner_response?.text || null,
        ownerResponseTime: review.owner_response?.time ? new Date(review.owner_response.time * 1000) : null,
        language: review.language,
        reviewIndex: index,
      },
    }));
  }

  private getSentimentFromRating(rating: number): string {
    if (rating >= 4) return 'POSITIVE';
    if (rating <= 2) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  private handleError(error: any): void {
    const status = error.response?.status;
    const msg = error.response?.data?.error_message;

    if (status === 400) {
      console.error(`   ❌ Bad request. Check place_id format.`);
    } else if (status === 403) {
      console.error(`   ❌ Access denied. Check API key and enable Google Places API.`);
    } else if (status === 429) {
      console.error(`   ❌ Rate limit exceeded. Wait before next request.`);
    } else {
      console.error(`   ❌ Error: ${msg || error.message}`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.client.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: 'test',
            key: this.apiKey,
          },
        }
      );
      return response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS';
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const isValid = await this.validateCredentials();
    return {
      success: isValid,
      message: isValid ? 'Google Reviews API credentials are valid' : 'Google Reviews API credentials are invalid'
    };
  }
}