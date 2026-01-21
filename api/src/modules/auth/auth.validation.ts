import { z } from 'zod';

// ============================================
// SCHÉMAS D'AUTHENTIFICATION
// ============================================

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

/**
 * Schéma de validation pour le rafraîchissement du token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Schéma de validation pour la demande de réinitialisation de mot de passe
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * Schéma de validation pour la réinitialisation de mot de passe
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters')
    .max(100, 'Password is too long')
    .refine(
      (password) => password !== undefined,
      'New password cannot be the same as current password'
    ),
});

/**
 * Schéma de validation pour la vérification d'email
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Schéma de validation pour renvoyer l'email de vérification
 */
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// ============================================
// TYPES TYPESCRIPT INFÉRÉS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

// ============================================
// SCHÉMAS AVANCÉS (Optionnels)
// ============================================

/**
 * Schéma renforcé pour le mot de passe avec complexité
 * Utiliser ce schéma si vous voulez des règles plus strictes
 */
export const strongPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Schéma d'inscription avec validation de mot de passe renforcée
 * À utiliser en production pour plus de sécurité
 */
export const registerStrongSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: strongPasswordSchema,
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  organizationName: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name is too long'),
});

/**
 * Schéma pour la mise à jour du profil utilisateur
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided'
);

/**
 * Schéma pour la validation du code 2FA
 */
export const twoFactorSchema = z.object({
  code: z.string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;