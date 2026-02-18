import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organizations.service';
import { OrganizationResponse, OrganizationsResponse, DeleteResponse } from './organizations.types';
import { logger } from '@/infrastructure/logger';

class OrganizationsController {
  async getAllOrganizations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all organizations');
      const organizations = await organizationService.getAllOrganizations();
      const response: OrganizationsResponse = {
        success: true,
        data: organizations,
        count: organizations.length,
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      logger.error('Error fetching organization:', error);
      next(error);
    }
  }

  async getOrganizationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching organization with id: ${id}`);
      const organization = await organizationService.getOrganizationById(id);
      if (!organization) {
        res.status(404).json({
          success: false,
          message: `Organization with id ${id} not found`,
        });
        return;
      }
      res.status(200).json({ success: true, data: organization });
      return;
    } catch (error) {
      logger.error(`Error fetching organization by id:`, error);
      next(error);
    }
  }

  async createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, industry, numberTeam, subscriptionTier, ownerId, slug } = req.body;

      if (!ownerId) {
        res.status(400).json({ success: false, message: 'ownerId is required' });
        return;
      }

      logger.info('Creating new organization', { name, industry, numberTeam, subscriptionTier });
      const newOrganization = await organizationService.createOrganization({
        name,
        industry,
        numberTeam,
        subscriptionTier,
        ownerId,
        slug
      });
      const response: OrganizationResponse = { success: true, data: newOrganization };
      res.status(201).json(response);
      return;
    } catch (error) {
      logger.error('Error creating organization:', error);
      next(error);
    }
  }

  async updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, industry, numberTeam, slug } = req.body;
      logger.info(`Updating organization ${id}`, { name, industry, numberTeam, slug });
      const updatedOrganization = await organizationService.updateOrganization(id, {
        name,
        industry,
        numberTeam,
        slug
      });
      if (!updatedOrganization) {
        res.status(404).json({
          success: false,
          message: `Organization with id ${id} not found`,
        });
        return;
      }
      const response: OrganizationResponse = { success: true, data: updatedOrganization };
      res.status(200).json(response);
      return;
    } catch (error) {
      logger.error('Error updating organization:', error);
      next(error);
    }
  }

  async deleteOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Deleting organization ${id}`);
      const deleted = await organizationService.deleteOrganization(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `Organization with id ${id} not found`,
        });
        return;
      }
      const response: DeleteResponse = {
        success: true,
        message: `Organization with id ${id} successfully deleted`,
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      logger.error('Error deleting organization:', error);
      next(error);
    }
  }
}

export const organizationController = new OrganizationsController();
