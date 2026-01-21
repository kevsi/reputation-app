import { createClient } from 'redis';
import { config } from './app';
import { logger } from '../infrastructure/logger';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

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
    logger.error('Redis Client Error', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis Client Ready');
  });

  redisClient.on('end', () => {
    logger.info('Redis Client Disconnected');
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

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectRedis();
});