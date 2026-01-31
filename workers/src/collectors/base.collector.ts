/**
 * 🏗️ Base Collector Interface & Factory
 * 
 * Chaque plateforme (Twitter, Facebook, Trustpilot) implémente cette interface
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { SourceType, Source } from '@sentinelle/database';
import {
  CollectorType,
  isCollectorEnabled,
  getCollectorReason,
  getEnabledCollectorTypes,
  getDisabledCollectorTypes,
  getUnavailableCollectorMessage,
  isValidCollectorType,
  AVAILABLE_COLLECTORS,
  getCollectorConfig,
  getEnabledCollectorsList
} from '../config/collectors.config';

export interface RawMention {
  text: string;
  author: string;
  authorUrl?: string;
  authorAvatar?: string;
  url: string;
  publishedAt: Date;
  externalId: string;
  platform: SourceType;
  engagementCount?: number;
  rawData?: Record<string, any>;
}

export interface CollectorConfig {
  [key: string]: any;
}

/**
 * Interface que tous les collectors doivent implémenter
 */
export interface ICollector {
  collect(source: Source, keywords: string[]): Promise<RawMention[]>;
  validateCredentials(config: CollectorConfig): Promise<boolean>;
  testConnection(config: CollectorConfig): Promise<{ success: boolean; message: string }>;
}

/**
 * Classe abstraite pour collectors
 */
export abstract class BaseCollector implements ICollector {
  protected axiosInstance = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 10000
  });

  abstract collect(source: Source, keywords: string[]): Promise<RawMention[]>;

  async validateCredentials(config: CollectorConfig): Promise<boolean> {
    try {
      const result = await this.testConnection(config);
      return result.success;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  abstract testConnection(config: CollectorConfig): Promise<{ success: boolean; message: string }>;

  protected async fetchHtml(url: string): Promise<string> {
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  protected loadCheerio(html: string) {
    return cheerio.load(html);
  }
}

/**
 * Factory pour obtenir le bon collector
 * Gère l'enregistrement, la validation et la création des instances de collectors
 */
export class CollectorFactory {
  private static collectors: Map<string, new () => ICollector> = new Map();
  private static initialized: boolean = false;

  /**
   * Initialise la factory au démarrage de l'application
   * Cette méthode ne s'exécute qu'une seule fois
   */
  static initialize(): void {
    if (this.initialized) {
      console.debug('ℹ️  CollectorFactory already initialized');
      return;
    }

    console.info('\n🔧 Initializing Collectors...\n');

    const enabledCollectors = getEnabledCollectorTypes();
    const disabledCollectors = getDisabledCollectorTypes();

    console.info(`📊 Found ${enabledCollectors.length} enabled collectors, ${disabledCollectors.length} disabled\n`);

    // Logger les collectors désactivés avec raison et alternative
    if (disabledCollectors.length > 0) {
      for (const collector of disabledCollectors) {
        console.warn(`⏭️  Collector ${collector.type} is DISABLED`);
        console.warn(`   Reason: ${collector.reason}`);
        if (collector.alternative) {
          console.warn(`   Alternative: ${collector.alternative}`);
        }
        console.warn('');
      }
    }

    this.initialized = true;
  }

  /**
   * Enregistre un collector si celui-ci est activé dans la config
   * @param type - Type du collector
   * @param collectorClass - Classe du collector
   * @throws Error si le collector est invalide
   */
  static registerCollector(type: CollectorType, collectorClass: new () => ICollector): void {
    // Vérifier que le type existe dans la config
    if (!isValidCollectorType(type)) {
      throw new Error(`❌ Invalid collector type: ${type}`);
    }

    // Vérifier que le collector est activé
    if (!isCollectorEnabled(type)) {
      const config = AVAILABLE_COLLECTORS[type as CollectorType];
      const reason = 'reason' in config ? config.reason : 'Unknown';
      console.warn(`⏭️  Collector ${type} is disabled: ${reason} - NOT registering`);
      return;
    }

    // Enregistrer le collector
    this.collectors.set(type, collectorClass);
    const config = AVAILABLE_COLLECTORS[type as CollectorType];
    const desc = 'description' in config ? config.description : '';
    console.info(`✅ Registered collector: ${type} - ${desc || ''}`);
  }

  /**
   * Récupère une instance d'un collector avec validation complète
   * Lanc une erreur explicite si le collector n'est pas disponible
   * @param type - Type du collector
   * @returns Instance du collector
   */
  static getCollector(type: string): ICollector {
    // 1. Vérifier que c'est un type valide
    if (!isValidCollectorType(type)) {
      const message = getUnavailableCollectorMessage(type);
      throw new Error(message);
    }

    // 2. Vérifier que le collector est activé
    if (!isCollectorEnabled(type)) {
      const config = AVAILABLE_COLLECTORS[type as CollectorType];
      const reason = 'reason' in config ? config.reason : 'Unknown reason';
      const msg = `🚫 Collector "${type}" is disabled: ${reason}`;
      
      const alternative = 'alternative' in config ? config.alternative : null;
      if (alternative) {
        throw new Error(`${msg}\n   👉 Alternative: ${alternative}`);
      }
      throw new Error(msg);
    }

    // 3. Vérifier que le collector est enregistré
    const CollectorClass = this.collectors.get(type);
    if (!CollectorClass) {
      throw new Error(
        `❌ Collector "${type}" is not registered.\n` +
        `   The collector is enabled in config but not registered.\n` +
        `   Check src/collectors/index.ts for missing registration.`
      );
    }

    return new CollectorClass();
  }

  /**
   * Récupère la liste des collectors enregistrés (pour debug/monitoring)
   * @returns Array des types de collectors actuellement enregistrés
   */
  static getRegisteredCollectors(): string[] {
    return Array.from(this.collectors.keys());
  }

  /**
   * Vérifie si un collector spécifique est enregistré
   * @param type - Type du collector
   * @returns true si le collector est enregistré
   */
  static isRegistered(type: string): boolean {
    return this.collectors.has(type);
  }

  /**
   * Récupère la configuration d'un collector
   * @param type - Type du collector
   * @returns Configuration du collector ou lance une erreur
   */
  static getCollectorInfo(type: string) {
    return getCollectorConfig(type);
  }

  /**
   * Récupère la liste des collectors activés dans la config
   * @returns Array des types de collectors activés
   */
  static getEnabledCollectorTypes(): CollectorType[] {
    return getEnabledCollectorTypes();
  }

  /**
   * Récupère la liste des collectors désactivés dans la config
   * @returns Array des types de collectors désactivés avec détails
   */
  static getDisabledCollectorTypes() {
    return getDisabledCollectorTypes();
  }

  /**
   * Récupère la liste de tous les collectors activés avec détails
   * @returns Array des collectors avec type, description, rateLimit, etc.
   */
  static getEnabledCollectorsList() {
    return getEnabledCollectorsList();
  }
}
