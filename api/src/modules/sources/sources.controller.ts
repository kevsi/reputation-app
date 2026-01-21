import { Request, Response, NextFunction } from 'express';
import { sourcesService } from './sources.service';
import { SourcesResponse } from './sources.types';
import { logger } from '@/infrastructure/logger';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';

class SourcesController {
  async getAllSources(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all sources');
      const sources = await sourcesService.getAllSources();
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
   * Enqueue an immediate scraping job for a given source.
   * This is a MVP helper to avoid waiting for the hourly cron in workers.
   */
  async scrapeNow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const source = await sourcesService.getSourceById(id);

      if (!source) {
        res.status(404).json({ success: false, message: `Source with id ${id} not found` });
        return;
      }

      // Keep payload compatible with workers `scraping.processor.ts`
      const job = await scrapingQueue.add({
        sourceId: source.id,
        url: source.url,
        brandId: source.brandId,
        type: source.type,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
        removeOnComplete: true,
      });

      res.status(202).json({
        success: true,
        data: {
          jobId: job.id,
          sourceId: source.id,
          queuedAt: new Date().toISOString(),
        }
      });
      return;
    } catch (error) {
      logger.error('Error enqueueing scrape job:', error);
      next(error);
    }
  }

  async createSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, url, type, isActive, brandId } = req.body;

      if (!name || !type || !brandId) {
        res.status(400).json({ success: false, message: 'Missing required fields: name, type, brandId' });
        return;
      }

      const newSource = await sourcesService.createSource({ name, url, type, isActive, brandId });
      res.status(201).json({ success: true, data: newSource });
      return;
    } catch (error) {
      logger.error('Error creating source:', error);
      next(error);
    }
  }

  async updateSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, url, type, isActive } = req.body;

      const updatedSource = await sourcesService.updateSource(id, { name, url, type, isActive });
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

export const sourcesController = new SourcesController();
