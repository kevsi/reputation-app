import { Logger } from '../shared/logger';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5001'),
  API_VERSION: z.string().default('v1'),

  CLIENT_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  LANDING_URL: z.string().url(),

  DATABASE_URL: z.string(),

  // Database connection pool settings
  DATABASE_POOL_SIZE: z.string().transform(Number).default('10'),
  DATABASE_CONNECTION_TIMEOUT: z.string().transform(Number).default('10'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  EMAIL_PROVIDER: z.string().default('sendgrid'),
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string(),

  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_API_KEY: z.string().optional(),

  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('eu-west-1'),

  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      Logger.error('Variables d\'environnement invalides', error instanceof Error ? error : new Error('Erreur de validation d\'environnement'), { composant: 'ConfigApp', operation: 'parseEnv' });
      error.errors.forEach((err) => {
        Logger.error('Erreur de validation d\'environnement', error instanceof Error ? error : new Error('Erreur de validation d\'environnement'), { composant: 'ConfigApp', operation: 'parseEnv', path: err.path, message: err.message });
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnv();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';