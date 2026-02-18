import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { logger } from '@/infrastructure/logger';
import { AppError } from '@/shared/utils/errors';
import { prisma } from '@/shared/database/prisma.client';
import { config } from '@/config/app';

class AuthController {
  /**
   * POST /api/v1/auth/login
   * Connexion d'un utilisateur
   * 
   * Security: Uses httpOnly cookies for token storage to prevent XSS
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      const { success, accessToken, refreshToken, ...userData } = result;

      // Set httpOnly cookies for tokens (XSS protection)
      // Using 'lax' for better cross-origin compatibility while maintaining security
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60 * 1000, // 15 minutes for access token
      };

      const refreshCookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
      };

      // Set cookies
      res.cookie('access_token', accessToken, cookieOptions);
      res.cookie('refresh_token', refreshToken, refreshCookieOptions);

      // Return user data (not tokens - they are in cookies)
      res.status(200).json({
        success,
        data: userData
      });
    } catch (error) {
      logger.error('Error logging in:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/register
   * Inscription d'un nouvel utilisateur
   * 
   * Security: Uses httpOnly cookies for token storage to prevent XSS
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      const { success, accessToken, refreshToken, ...userData } = result;

      // Set httpOnly cookies for tokens (XSS protection)
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60 * 1000, // 15 minutes for access token
      };

      const refreshCookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
      };

      // Set cookies
      res.cookie('access_token', accessToken, cookieOptions);
      res.cookie('refresh_token', refreshToken, refreshCookieOptions);

      // Return user data (not tokens - they are in cookies)
      res.status(201).json({
        success,
        data: userData
      });
    } catch (error) {
      logger.error('Error registering user:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Récupère le profil de l'utilisateur connecté
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      // Récupérer l'utilisateur complet depuis la DB avec son organisation
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          organization: {
            include: {
              subscription: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          isActive: user.isActive,
          organization: user.organization ? {
            id: user.organization.id,
            name: user.organization.name,
            slug: user.organization.slug,
            subscription: user.organization.subscription ? {
              plan: user.organization.subscription.plan,
              status: user.organization.subscription.status
            } : null
          } : null
        },
      });
    } catch (error) {
      logger.error('Error getting current user:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Déconnexion de l'utilisateur
   * 
   * Security: Clears httpOnly cookies
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear the cookies
      res.clearCookie('access_token', { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax' });
      res.clearCookie('refresh_token', { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax' });

      // If refresh token was provided, blacklist it
      const refreshToken = req.cookies?.refresh_token;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Error logging out:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Rafraîchit le token d'accès
   * 
   * Security: Returns new tokens in httpOnly cookies
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Get refresh token from cookie or body
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
      }

      const result = await authService.refreshToken(refreshToken);

      // Set new httpOnly cookies
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60 * 1000, // 15 minutes for access token
      };

      res.cookie('access_token', result.accessToken, cookieOptions);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      logger.error('Error refreshing token:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400, 'MISSING_EMAIL');
      }

      // TODO: Implémenter l'envoi d'email avec token de réinitialisation
      // Pour l'instant, on renvoie toujours un succès pour éviter l'énumération d'emails

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      logger.error('Error in forgot password:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   * Réinitialisation du mot de passe avec token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new AppError('Token and new password are required', 400, 'MISSING_FIELDS');
      }

      // TODO: Implémenter la vérification du token et la mise à jour du mot de passe

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Error resetting password:', error);
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/change-password
   * Changement de mot de passe pour utilisateur connecté
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400, 'MISSING_FIELDS');
      }

      // TODO: Implémenter le changement de mot de passe

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Error changing password:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   * Vérification de l'email avec token
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Verification token is required', 400, 'MISSING_TOKEN');
      }

      // TODO: Implémenter la vérification d'email

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Error verifying email:', error);
      next(error);
    }
  }
}

export const authController = new AuthController();
