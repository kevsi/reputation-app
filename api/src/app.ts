import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/app';
import { errorHandler, notFoundHandler } from '@/shared/middleware/error.middleware';
import { logger } from './infrastructure/logger';
import { prisma } from '@/shared/database/prisma.client';
import sourcesRoutes from './modules/sources/sources.routes';
import organizationsRoutes from './modules/organizations/organizations.routes'
import alertsRoutes from './modules/alerts/alerts.routes'
import keywordsRoutes from './modules/keywords/keywords.routes'
import mentionsRoutes from './modules/mentions/mentions.routes'
import brandsRoutes from './modules/brands/brands.routes'
import usersRoutes from './modules/users/users.routes';
import reportsRoutes from './modules/reports/reports.routes';
import actionsRoutes from './modules/actions/actions.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import authRoutes from './modules/auth/auth.routes';
import billingRoutes from './modules/billing/billing.routes';
import systemRoutes from './modules/system/system.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';



export const createApp = (): Application => {
  const app = express();

  // ===== Security & Basic Middleware =====

  // Helmet pour sécuriser les headers HTTP
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: [config.CLIENT_URL, config.ADMIN_URL, config.LANDING_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Compression des réponses
  app.use(compression() as any);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    }
  });
  app.use(limiter);

  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Parse cookies
  app.use(cookieParser() as any);


  // ===== Logging Middleware =====
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      });
    });

    next();
  });

  // ===== Health Check =====
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });

  // ===== PUBLIC DEMO ENDPOINT (no auth required) =====
  app.get('/demo/mentions', async (_req: Request, res: Response) => {
    try {
      const mentions = await prisma.mention.findMany({
        include: { brand: true, source: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      res.json({
        success: true,
        count: mentions.length,
        message: 'Demo endpoint - mentions from database',
        data: mentions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== API Routes =====
  const apiRouter = express.Router();

  // Placeholder pour les routes (seront ajoutées dans les prochaines phases)
  apiRouter.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Sentinelle-Reputation API',
      version: config.API_VERSION,
      status: 'running',
    });
  });
  // Temporarily commented out to debug startup issues
  apiRouter.use('/sources', sourcesRoutes);
  apiRouter.use('/organizations', organizationsRoutes)
  apiRouter.use('/alerts', alertsRoutes)
  apiRouter.use('/brands', brandsRoutes)
  apiRouter.use('/keywords', keywordsRoutes)
  apiRouter.use('/mentions', mentionsRoutes)
  apiRouter.use('/users', usersRoutes)
  apiRouter.use('/reports', reportsRoutes)
  apiRouter.use('/actions', actionsRoutes)
  apiRouter.use('/analytics', analyticsRoutes)
  apiRouter.use('/auth', authRoutes)
  apiRouter.use('/billing', billingRoutes)
  apiRouter.use('/system', systemRoutes)
  apiRouter.use('/notifications', notificationsRoutes)

  // Mount API routes
  app.use(`/api/${config.API_VERSION}`, apiRouter);

  // ===== Error Handling =====

  // 404 handler - doit être avant le error handler
  app.use('*', notFoundHandler);

  // Global error handler (doit être en dernier)
  app.use(errorHandler);

  return app;
};