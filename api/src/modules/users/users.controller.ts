import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { ApiResponse } from '@/shared/types';
import { normalizeString } from '@/shared/utils/normalize';
import { Logger } from '../../shared/logger';

/**
 * 🎮 Controller Users
 * 
 * Fait le lien entre les routes HTTP et la logique métier.
 */
class UsersController {
    /**
     * GET /api/v1/users
     * 
     * Récupère tous les users (filtré par organisation de l'utilisateur connecté)
     */
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const organizationId = normalizeString(req.user?.organizationId);
            Logger.debug('Payload JWT complet', { user: req.user });
            Logger.debug('Recherche des utilisateurs pour organizationId', { organizationId });
            Logger.debug('Rôle utilisateur courant', { role: req.user?.role });

            // TEMP: Fetch ALL users to debug
            const allUsers = await usersService.getAllUsers(undefined);
            Logger.debug('Nombre total d\'utilisateurs en base', { total: allUsers.length });
            if (allUsers.length > 0) {
                Logger.debug('organizationId du premier utilisateur', { organizationId: allUsers[0].organizationId });
            }

            const users = await usersService.getAllUsers(organizationId);
            Logger.debug('Utilisateurs trouvés avec filtre', { count: users.length });

            const response: ApiResponse = {
                success: true,
                data: users,
                meta: { total: users.length }
            };

            return res.status(200).json(response);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/v1/users/active
     * 
     * Récupère uniquement les users actifs de l'organisation
     */
    async getActiveUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const organizationId = normalizeString(req.user?.organizationId);
            const users = await usersService.getActiveUsers(organizationId);


            const response: ApiResponse = {
                success: true,
                data: users,
                meta: { total: users.length }
            };

            return res.status(200).json(response);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/v1/users/:id
     * 
     * Récupère un user spécifique par son ID
     */
    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await usersService.getUserById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: `User with id ${id} not found` }
                });
            }

            // Vérifier que l'utilisateur appartient à la même organisation (sauf si admin global)
            if (req.user?.role !== 'ADMIN' && user.organizationId !== req.user?.organizationId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'You do not have access to this user' }
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/v1/users
     * 
     * Crée un nouvel user
     */
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Si l'utilisateur n'est pas admin global, forcer son organizationId
            const data = {
                ...req.body,
                organizationId: req.user?.role === 'ADMIN' ? req.body.organizationId : req.user?.organizationId
            };

            const newUser = await usersService.createUser(data);
            return res.status(201).json({ success: true, data: newUser });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * PATCH /api/v1/users/:id
     */
    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Vérifier les droits (simplifié: même org ou admin)
            const userToUpdate = await usersService.getUserById(id);
            if (!userToUpdate) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
            }

            if (req.user?.role !== 'ADMIN' && userToUpdate.organizationId !== req.user?.organizationId) {
                return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } });
            }

            const updatedUser = await usersService.updateUser(id, req.body);
            return res.status(200).json({ success: true, data: updatedUser });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * DELETE /api/v1/users/:id
     */
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const userToDelete = await usersService.getUserById(id);
            if (!userToDelete) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
            }

            if (req.user?.role !== 'ADMIN' && userToDelete.organizationId !== req.user?.organizationId) {
                return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } });
            }

            await usersService.deleteUser(id);
            return res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            return next(error);
        }
    }
}

export const usersController = new UsersController();