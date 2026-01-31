import { Request, Response, NextFunction } from 'express';
import { sourcesService } from './sources.service';
import { SourcesResponse } from './sources.types';
import { logger } from '@/infrastructure/logger';
import { prisma } from '@/shared/database/prisma.client';
import { PLANS } from '@/shared/constants/plans';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';

class SourcesController {
  async getAllSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      if (!user || !user.organizationId) {
        res.status(400).json({ success: false, message: 'Organization ID is required' });
        return;
      }
      
      logger.info(`Fetching sources for organization ${user.organizationId}`);
      const sources = await sourcesService.getSourcesByOrganization(user.organizationId);
      const response: SourcesResponse = { success: true, data: sources, count: sources.length };
      res.status(200).json(response);
      return;
    } catch (error) {
      logger.error('Error fetching sources:', error);
      next(error);
    }
  }

  async getActiveSources(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching active sources');
      const sources = await sourcesService.getActiveSources();
      const response: SourcesResponse = { success: true, data: sources, count: sources.length };
      res.status(200).json(response);
      return;
    } catch (error) {
      logger.error('Error fetching active sources:', error);
      next(error);
    }
  }

  async getSourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching source with id: ${id}`);
      const source = await sourcesService.getSourceById(id);
      if (!source) {
        res.status(404).json({ success: false, message: `Source with id ${id} not found` });
        return;
      }
      res.status(200).json({ success: true, data: source });
      return;
    } catch (error) {
      logger.error('Error fetching source by id:', error);
      next(error);
    }
  }

  /**
   * TEST CONNECTION
   * POST /api/sources/test
   * 
   * Teste la connexion à une plateforme
   */
  async testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, config } = req.body;

      if (!type || !config) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: type, config' 
        });
        return;
      }

      const result = await sourcesService.testConnection(type, config);
      res.status(200).json({ success: true, data: result });
      return;
    } catch (error) {
      logger.error('Error testing connection:', error);
      next(error);
    }
  }

  /**
   * SCRAPE NOW
   * POST /api/sources/:id/scrape-now
   * 
   * Déclenche un scraping immédiat
   */
  async scrapeNow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await sourcesService.scrapeNow(id);

      res.status(202).json({
        success: true,
        data: {
          jobId: result.jobId,
          sourceId: id,
          message: 'Scraping job queued successfully',
          checkStatus: `/api/jobs/${result.jobId}`
        }
      });
      return;
    } catch (error) {
      logger.error('Error triggering scrape:', error);
      next(error);
    }
  }

  async createSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { brandId, type, name, config } = req.body;
      const user = req.user as any;
      
      if (!brandId || !type || !name || !config) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: brandId, type, config' 
        });
        return;
      }

      // Vérifier que la marque appartient à l'utilisateur
      const brand = await prisma.brand.findFirst({
        where: {
          id: brandId,
          organization: { ownerId: user.id }
        }
      });
      
      if (!brand) {
        res.status(404).json({ success: false, message: 'Brand not found' });
        return;
      }

      // Vérifier limites du plan
      const plan = await getPlanForUser(user.id);
      const sourcesCount = await prisma.source.count({
        where: { brand: { organizationId: brand.organizationId } }
      });
      
      if (sourcesCount >= plan.limits.sources) {
        res.status(403).json({
          success: false,
          error: 'PLAN_LIMIT_REACHED',
          message: `Votre plan ${plan.name} permet seulement ${plan.limits.sources} source(s)`
        });
        return;
      }

      // Valider les credentials avec le collector (simulation pour l'instant)
      // TODO: Intégrer CollectorFactory.validateCredentials
      const isValid = await validateCredentials(type, config);
      
      if (!isValid) {
        res.status(400).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Les identifiants fournis sont invalides'
        });
        return;
      }

      // Créer la source
      const source = await prisma.source.create({
        data: {
          brandId,
          type,
          name,
          isActive: true,
          config
        }
      });

      // Déclencher le premier scraping immédiatement
      await scrapingQueue.add('scrape-source', {
        sourceId: source.id
      });

      // NOTE: Job récurrent est géré par le scheduler, 
      // pas par BullMQ repeat (conflit de gestion)
      // Le scheduler lit scrapingFrequency depuis la DB

      res.status(201).json(source);
      return;
    } catch (error) {
      logger.error('Error creating source:', error);
      next(error);
    }
  }

  async updateSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, type, config, scrapingFrequency } = req.body;

      const updatedSource = await sourcesService.updateSource(id, { name, type, config, scrapingFrequency });
      if (!updatedSource) {
        res.status(404).json({ success: false, message: `Source with id ${id} not found` });
        return;
      }

      res.status(200).json({ success: true, data: updatedSource });
      return;
    } catch (error) {
      logger.error('Error updating source:', error);
      next(error);
    }
  }

  async deleteSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await sourcesService.deleteSource(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: `Source with id ${id} not found` });
        return;
      }

      res.status(200).json({ success: true, message: `Source with id ${id} successfully deleted` });
      return;
    } catch (error) {
      logger.error('Error deleting source:', error);
      next(error);
    }
  }
}

// Fonction utilitaire pour récupérer le plan d'un utilisateur
async function getPlanForUser(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      organization: {
        ownerId: userId
      },
      status: 'ACTIVE'
    }
  });
  
  const planKey = subscription?.plan || 'FREE';
  return PLANS[planKey as keyof typeof PLANS];
}

// Validation basique des credentials (à améliorer avec CollectorFactory)
async function validateCredentials(type: string, config: any): Promise<boolean> {
  // Simulation de validation - à remplacer par l'appel réel au collector
  switch (type) {
    case 'TWITTER':
      return !!(config.apiKey && config.apiSecret && config.bearerToken);
    case 'TRUSTPILOT':
      return !!(config.companyName);
    case 'FACEBOOK':
      return !!(config.accessToken);
    default:
      return true; // Pour les autres types, accepter pour l'instant
  }
}

// Frequency parsing removed (unused in current controller)

export const sourcesController = new SourcesController();
