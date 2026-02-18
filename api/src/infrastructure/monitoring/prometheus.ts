import promClient from 'prom-client';
import { Application, Request, Response } from 'express';
import { Logger } from '../../shared/logger';

// Register standard metrics
promClient.collectDefaultMetrics();

// HTTP request duration histogram
export const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});

// Scraping jobs counter
export const scrapingJobsTotal = new promClient.Counter({
    name: 'scraping_jobs_total',
    help: 'Total number of scraping jobs',
    labelNames: ['status', 'source_type']
});

// Mentions created counter
export const mentionsCreated = new promClient.Counter({
    name: 'mentions_created_total',
    help: 'Total number of mentions created'
});

/**
 * 📊 Initialiser le Monitoring Prometheus
 */
export const initMonitoring = (app: Application) => {
    Logger.info('📊 Initializing Prometheus monitoring');

    // Endpoint pour les métriques
    app.get('/metrics', async (_req: Request, res: Response) => {
        try {
            res.set('Content-Type', promClient.register.contentType);
            res.end(await promClient.register.metrics());
        } catch (error) {
            res.status(500).end(error);
        }
    });

    // Middleware pour mesurer la durée des requêtes
    app.use((req: Request, res: Response, next: any) => {
        const route = req.path;
        const method = req.method;
        const end = httpRequestDuration.startTimer();

        res.on('finish', () => {
            end({ method, route, status_code: res.statusCode });
        });

        next();
    });
};
