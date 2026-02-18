import { getRedisClient } from '../../config/redis';
import { logger } from '../logger';

class CacheService {
  /**
   * Récupérer une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const value = await client.get(key);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Définir une valeur dans le cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const client = await getRedisClient();
      const stringValue = JSON.stringify(value);
      
      if (ttl) {
        await client.setEx(key, ttl, stringValue);
      } else {
        await client.set(key, stringValue);
      }
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Supprimer une valeur du cache
   */
  async del(key: string): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.error('Cache del error', { key, error });
    }
  }

  /**
   * Supprimer toutes les clés correspondant à un pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.error('Cache delPattern error', { pattern, error });
    }
  }

  /**
   * Vérifier si une clé existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Définir l'expiration d'une clé
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire error', { key, seconds, error });
    }
  }

  /**
   * Cache wrapper avec fonction de récupération
   */
  async wrap<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Essayer de récupérer depuis le cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Sinon, exécuter la fonction et mettre en cache
    const result = await fetchFn();
    await this.set(key, result, ttl);
    return result;
  }
}

export const cacheService = new CacheService();