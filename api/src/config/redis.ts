import { createClient } from 'redis';
import { config } from './app';
import { Logger } from '../shared/logger';

export type RedisClient = ReturnType<typeof createClient>;

export let redisClient: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
    password: config.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => {
    Logger.error('Erreur du client Redis', err as Error, { composant: 'Redis', operation: 'connect' });
  });

  redisClient.on('connect', () => {
    Logger.info('Client Redis connecté', { composant: 'Redis', operation: 'connect' });
  });

  redisClient.on('ready', () => {
    Logger.info('Client Redis prêt', { composant: 'Redis', operation: 'ready' });
  });

  redisClient.on('end', () => {
    Logger.info('Client Redis déconnecté', { composant: 'Redis', operation: 'disconnect' });
  });

  await redisClient.connect();

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Export pour BullMQ (format IORedis compatible)
export const redisConnection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectRedis();
});