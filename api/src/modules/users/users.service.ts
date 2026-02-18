import { prisma } from '@/shared/database/prisma.client';
import { AppError } from '@/shared/utils/errors';
import { Logger } from '../../shared/logger';
import { Role } from '@sentinelle/database';
import { passwordService } from '@/modules/auth/password.service';

/**
 * 🎯 Service Users
 * 
 * Contient toute la logique métier liée aux users utilisant Prisma.
 */
class UsersService {
    /**
     * Récupère tous les users d'une organisation
     * 
     * @param organizationId - Optionnel, filtre par organisation
     * @returns Tableau des users
     */
    async getAllUsers(organizationId?: string) {
        try {
            return await prisma.user.findMany({
                where: organizationId ? { organizationId } : {},
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    organization: {
                        select: { name: true }
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            Logger.error('Erreur lors de la récupération de tous les utilisateurs', error as Error, { composant: 'UsersService', operation: 'getAllUsers', organizationId });
            throw new AppError('Failed to fetch users', 500);
        }
    }

    /**
     * Récupère uniquement les users actifs
     * 
     * @param organizationId - Optionnel, filtre par organisation
     * @returns Tableau de users actifs
     */
    async getActiveUsers(organizationId?: string) {
        try {
            return await prisma.user.findMany({
                where: {
                    isActive: true,
                    ...(organizationId ? { organizationId } : {}),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            Logger.error('Erreur lors de la récupération des utilisateurs actifs', error as Error, { composant: 'UsersService', operation: 'getActiveUsers', organizationId });
            throw new AppError('Failed to fetch active users', 500);
        }
    }

    /**
     * Récupère un user par ID
     * 
     * @param id - Identifiant de l'user
     * @returns User trouvé ou null
     */
    async getUserById(id: string) {
        try {
            return await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            Logger.error('Erreur lors de la récupération d\'un utilisateur par ID', error as Error, { composant: 'UsersService', operation: 'getUserById', id });
            throw new AppError('Failed to fetch user', 500);
        }
    }

    /**
     * Crée un nouvel user
     * 
     * @param data - Données du nouvel user
     * @returns User créé
     */
    async createUser(data: any) {
        try {
            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser) {
                throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
            }

            // Hasher le mot de passe
            const hashedPassword = await passwordService.hash(data.password);

            return await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    name: data.name,
                    role: data.role as Role,
                    organizationId: data.organizationId,
                    isActive: data.isActive ?? true,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
            Logger.error('Erreur lors de la création d\'un utilisateur', error as Error, { composant: 'UsersService', operation: 'createUser' });
            throw new AppError('Failed to create user', 500);
        }
    }

    /**
     * Met à jour un user existant
     * 
     * @param id - Identifiant de l'user
     * @param data - Données à mettre à jour
     * @returns User mis à jour ou null si non trouvé
     */
    async updateUser(id: string, data: any) {
        try {
            return await prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            Logger.error('Erreur lors de la mise à jour d\'un utilisateur', error as Error, { composant: 'UsersService', operation: 'updateUser', id });
            if ((error as any).code === 'P2025') {
                return null;
            }
            throw new AppError('Failed to update user', 500);
        }
    }

    /**
     * Supprime un user
     * 
     * @param id - Identifiant de l'user
     * @returns true si supprimé, false si non trouvé
     */
    async deleteUser(id: string): Promise<boolean> {
        try {
            await prisma.user.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            Logger.error('Erreur lors de la suppression d\'un utilisateur', error as Error, { composant: 'UsersService', operation: 'deleteUser', id });
            if ((error as any).code === 'P2025') {
                return false;
            }
            throw new AppError('Failed to delete user', 500);
        }
    }
}

// Export une instance unique (Singleton pattern)
export const usersService = new UsersService();

