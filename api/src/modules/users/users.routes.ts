import { Router } from 'express';
import { usersController } from './users.controller';
import { validate } from '@/shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '@/shared/middleware/auth.middleware';
import { createUserSchema, updateUserSchema } from '@/shared/validators/schemas';

const router: Router = Router();

// Toutes les routes users nécessitent d'être connecté
router.use(requireAuth);

/**
 * @route   GET /api/v1/users
 * @desc    Récupérer tous les users de l'organisation
 */
router.get('/', usersController.getAllUsers.bind(usersController));

/**
 * @route   GET /api/v1/users/active
 * @desc    Récupérer uniquement les users actifs
 */
router.get('/active', usersController.getActiveUsers.bind(usersController));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Récupérer un user par son ID
 */
router.get('/:id', usersController.getUserById.bind(usersController));

/**
 * @route   POST /api/v1/users
 * @desc    Créer un nouvel user (Admin seulement)
 */
router.post(
    '/',
    requireRole('ADMIN'),
    validate(createUserSchema),
    usersController.createUser.bind(usersController)
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Mettre à jour un user
 */
router.patch(
    '/:id',
    validate(updateUserSchema),
    usersController.updateUser.bind(usersController)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Supprimer un user (Admin seulement)
 */
router.delete(
    '/:id',
    requireRole('ADMIN'),
    usersController.deleteUser.bind(usersController)
);

export default router;
