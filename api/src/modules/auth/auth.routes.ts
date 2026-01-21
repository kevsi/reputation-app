import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '@/shared/middleware/validate.middleware';
import { requireAuth } from '@/shared/middleware/auth.middleware';
import {
  loginSchema,
  registerSchema,
} from '@/shared/validators/schemas';
import { z } from 'zod';

const router = Router();

// On garde une définition locale pour les schémas spécifiques à l'auth s'ils ne sont pas déjà dans shared
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// ============================================
// ROUTES D'AUTHENTIFICATION DE BASE
// ============================================

/**
 * POST /api/v1/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController)
);

/**
 * POST /api/v1/auth/login
 * Connexion d'un utilisateur
 */
router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController)
);

/**
 * POST /api/v1/auth/logout
 * Déconnexion de l'utilisateur
 */
router.post(
  '/logout',
  requireAuth,
  authController.logout.bind(authController)
);

/**
 * GET /api/v1/auth/me
 * Récupère le profil de l'utilisateur connecté
 */
router.get(
  '/me',
  requireAuth,
  authController.me.bind(authController)
);

// ============================================
// ROUTES DE GESTION DES TOKENS
// ============================================

/**
 * POST /api/v1/auth/refresh
 * Rafraîchit le token d'accès
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh.bind(authController)
);

// ============================================
// ROUTES DE GESTION DU MOT DE PASSE
// ============================================

/**
 * POST /api/v1/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

/**
 * POST /api/v1/auth/reset-password
 * Réinitialise le mot de passe avec un token
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

/**
 * PATCH /api/v1/auth/change-password
 * Change le mot de passe de l'utilisateur connecté
 */
router.patch(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

// ============================================
// ROUTES DE VÉRIFICATION D'EMAIL
// ============================================

/**
 * POST /api/v1/auth/verify-email
 * Vérifie l'email avec un token
 */
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail.bind(authController)
);

export default router;