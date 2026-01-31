/**
 * 🎭 MockCollector - Test Data Generator
 * 
 * Collector de test qui simule des données réelles sans faire d'appels API
 * Utilisé UNIQUEMENT pour les tests et l'audit système
 * 
 * IMPORTANT: N'effectue AUCUN appel API externe
 * IMPORTANT: Préserve 100% des quotas API
 */

import { BaseCollector, RawMention } from '../base.collector';
import { Source } from '@sentinelle/database';

/**
 * MockCollector - Génère des mentions factices pour les tests
 */
export class MockCollector extends BaseCollector {
  private sourceType: string;

  constructor(sourceType: string = 'MOCK') {
    super();
    this.sourceType = sourceType;
  }

  /**
   * Collecte des mentions factices
   * Simule un appel API réel sans le faire
   * 
   * @param source - Source de données
   * @param keywords - Mots-clés (non utilisés pour le mock)
   * @returns Mentions factices
   */
  async collect(source: Source, keywords: string[]): Promise<RawMention[]> {
    console.log(`🎭 [MOCK] Simulating collection for source: ${source.id} (${this.sourceType})`);
    console.log(`🎭 [MOCK] Keywords: ${keywords.join(', ')}`);
    
    // Simuler un délai réseau
    await this.delay(500);

    // Générer des mentions de test
    const mockMentions = this.generateMockMentions(source);
    
    console.log(`✅ [MOCK] Generated ${mockMentions.length} test mentions`);
    
    return mockMentions;
  }

  /**
   * Vérifie les credentials (mock)
   * Toujours succès puisqu'il n'y a pas de vraies credentials
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Mock collector - no credentials needed'
    };
  }

  /**
   * Génère des mentions de test réalistes
   */
  private generateMockMentions(source: Source): RawMention[] {
    const count = 5; // Nombre de mentions de test
    const mentions: RawMention[] = [];

    for (let i = 0; i < count; i++) {
      mentions.push({
        // Identifiants
        externalId: `mock-${this.sourceType.toLowerCase()}-${Date.now()}-${i}`,
        
        // Contenu
        text: this.generateMockContent(i),
        author: `TestUser${i + 1}`,
        authorUrl: `https://example.com/users/testuser${i + 1}`,
        authorAvatar: `https://ui-avatars.com/api/?name=TestUser${i + 1}`,
        
        // Engagement
        engagementCount: this.getRandomEngagement(),
        
        // Dates
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        
        // URL
        url: `https://example.com/${this.sourceType.toLowerCase()}/mention-${i}`,
        
        // Plateforme
        platform: 'MOCK' as any,
        
        // Métadonnées
        rawData: {
          isMock: true,
          testId: `mock-${Date.now()}-${i}`,
          rating: this.getRandomRating(),
          sentiment: this.getRandomSentiment(),
          sourceId: source.id,
          sourceType: source.type,
        },
      });
    }

    return mentions;
  }

  /**
   * Génère du contenu de test varié
   */
  private generateMockContent(index: number): string {
    const templates = [
      'This is a test review with positive feedback. Great product!',
      'Average experience. Could be better but acceptable.',
      'Not satisfied with the service. Need improvements.',
      'Excellent quality and fast delivery. Highly recommended!',
      'Mixed feelings about this. Some good points, some bad.',
      'Amazing experience with the brand. Would recommend!',
      'Disappointed with recent purchases. Quality declined.',
      'Neutral opinion. Nothing special but works as expected.',
      'Outstanding customer service! Very helpful team.',
      'Terrible experience. Will not buy again.',
    ];

    return templates[index % templates.length];
  }

  /**
   * Génère un rating aléatoire (1-5)
   */
  private getRandomRating(): number {
    return Math.floor(Math.random() * 5) + 1;
  }

  /**
   * Génère un sentiment aléatoire
   */
  private getRandomSentiment(): string {
    const sentiments = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  /**
   * Génère un count d'engagement aléatoire
   */
  private getRandomEngagement(): number {
    return Math.floor(Math.random() * 500) + 1;
  }

  /**
   * Simule un délai réseau
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
