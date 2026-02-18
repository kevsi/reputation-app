/**
 * Controller Sources - Gestion des requêtes HTTP
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { Request, Response, RequestHandler } from 'express';
import { SourcesService } from './sources.service';
import { asyncHandler } from '@/shared/utils/async-handler';
import { success } from '@/shared/utils/api-response';
import { AppError } from '@/shared/utils/errors';

export class SourcesController {
  private service: SourcesService;

  constructor() {
    this.service = new SourcesService();
  }

  /**
   * Récupérer toutes les sources d'une brand
   */
  getByBrandId: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { brandId } = req.params;

    const sources = await this.service.getByBrandId(brandId);

    success(res, sources, 'Sources récupérées avec succès');
  });

  /**
   * Récupérer une source par ID
   */
  getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;

    const source = await this.service.getById(sourceId);

    if (!source) {
      throw new AppError('Source non trouvée', 404);
    }

    success(res, source, 'Source récupérée avec succès');
  });

  /**
   * Créer une nouvelle source
   */
  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { brandId } = req.params;
    const userId = (req as any).user?.id ?? (req as any).user?.userId;

    if (!userId) {
      throw new AppError('Authentification requise', 401);
    }

    const source = await this.service.create(userId, brandId, req.body);

    success(res, source, 'Source créée avec succès', 201);
  });

  /**
   * Mettre à jour une source
   */
  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;

    const source = await this.service.update(sourceId, req.body);

    success(res, source, 'Source mise à jour avec succès');
  });

  /**
   * Supprimer une source (soft delete)
   */
  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;

    await this.service.delete(sourceId);

    success(res, null, 'Source supprimée avec succès');
  });

  /**
   * Changer le statut d'une source
   */
  updateStatus: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    const { status } = req.body;

    const source = await this.service.updateStatus(sourceId, status);

    success(res, source, 'Statut mis à jour avec succès');
  });

  /**
   * Déclencher un scraping manuel
   */
  triggerScraping: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;

    const result = await this.service.triggerScraping(sourceId);

    success(res, result, 'Scraping déclenché avec succès');
  });
}

export const sourcesController = new SourcesController();
