/**
 * 📋 Schémas de validation Zod pour les formulaires Sentinelle
 * 
 * Ce fichier contient tous les schémas de validation réutilisables
 * pour les différents formulaires de l'application.
 */

import { z } from 'zod';

/**
 * Schéma de validation pour l'email
 * - Doit être un email valide
 * - Maximum 255 caractères
 */
export const emailSchema = z
  .string()
  .min(1, 'L\'email est requis')
  .email('Adresse email invalide')
  .max(255, 'L\'email ne peut pas dépasser 255 caractères');

/**
 * Schéma de validation pour le mot de passe
 * - Minimum 8 caractères
 * - Au moins une lettre majuscule
 * - Au moins une lettre minuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial
 */
export const passwordSchema = z
  .string()
  .min(1, 'Le mot de passe est requis')
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial');

/**
 * Schéma de validation pour le mot de passe faible (moins strict)
 */
export const weakPasswordSchema = z
  .string()
  .min(1, 'Le mot de passe est requis')
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères');

/**
 * Schéma de validation pour la confirmation du mot de passe
 */
export const confirmPasswordSchema = (password: string) => z
  .string()
  .min(1, 'La confirmation du mot de passe est requise')
  .refine((val) => val === password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  });

/**
 * Schéma de validation pour le nom
 * - Minimum 2 caractères
 * - Maximum 100 caractères
 * - Lettres, espaces, tirets et apostrophes uniquement
 */
export const nameSchema = z
  .string()
  .min(1, 'Le nom est requis')
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne peut pas dépasser 100 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres');

/**
 * Schéma de validation pour le prénom
 */
export const firstNameSchema = nameSchema;

/**
 * Schéma de validation pour le nom de famille
 */
export const lastNameSchema = nameSchema;

/**
 * Schéma de validation pour le nom de l'organisation
 */
export const organizationNameSchema = z
  .string()
  .min(1, 'Le nom de l\'organisation est requis')
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne peut pas dépasser 100 caractères');

/**
 * Schéma de validation pour l'URL du site web
 */
export const websiteUrlSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    'L\'URL doit commencer par http:// ou https://'
  );

/**
 * Schéma de validation pour le numéro de téléphone
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val === '' || /^[+]?[\d\s\-()]+$/.test(val),
    'Numéro de téléphone invalide'
  );

/**
 * Schéma de validation pour le nom de marque
 */
export const brandNameSchema = z
  .string()
  .min(1, 'Le nom de la marque est requis')
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne peut pas dépasser 100 caractères');

/**
 * Schéma de validation pour l'URL d'une source
 */
export const sourceUrlSchema = z
  .string()
  .min(1, 'L\'URL est requise')
  .url('URL invalide')
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    'L\'URL doit être une adresse HTTP ou HTTPS'
  );

/**
 * Schéma de validation pour le slug d'organisation
 */
export const organizationSlugSchema = z
  .string()
  .min(1, 'Le slug est requis')
  .min(3, 'Le slug doit contenir au moins 3 caractères')
  .max(50, 'Le slug ne peut pas dépasser 50 caractères')
  .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
  .regex(/^[a-z]/, 'Le slug doit commencer par une lettre');

/**
 * Schéma de validation pour le texte (contenu)
 */
export const textContentSchema = z
  .string()
  .min(1, 'Le contenu est requis')
  .min(10, 'Le contenu doit contenir au moins 10 caractères')
  .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères');

/**
 * Schéma de validation pour la description
 */
export const descriptionSchema = z
  .string()
  .max(500, 'La description ne peut pas dépasser 500 caractères');

/**
 * Schéma de validation pour les mots-clés
 */
export const keywordsSchema = z
  .array(z.string())
  .min(1, 'Au moins un mot-clé est requis')
  .max(50, 'Vous ne pouvez pas ajouter plus de 50 mots-clés')
  .refine(
    (val) => val.every(k => k.length >= 2),
    'Chaque mot-clé doit contenir au moins 2 caractères'
  );

/**
 * Schéma de validation pour le seuil d'alerte
 */
export const alertThresholdSchema = z
  .number()
  .min(0, 'Le seuil ne peut pas être négatif')
  .max(100, 'Le seuil ne peut pas dépasser 100');

/**
 * Schéma de validation pour la fréquence de scraping (en secondes)
 */
export const scrapingFrequencySchema = z
  .number()
  .min(300, 'La fréquence minimum est de 5 minutes (300 secondes)')
  .max(86400, 'La fréquence maximum est de 24 heures (86400 secondes)');

/**
 * Schéma de validation pour le numéro SIRET (France)
 */
export const siretSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val === '' || /^\d{14}$/.test(val.replace(/\s/g, '')),
    'Le numéro SIRET doit contenir 14 chiffres'
  );

/**
 * Schéma de validation pour le code NAF (France)
 */
export const nafCodeSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val === '' || /^\d{4}[a-zA-Z]$/.test(val),
    'Le code NAF doit contenir 4 chiffres et une lettre'
  );

/**
 * Schéma de validation pour le numéro TVA (Europe)
 */
export const vatNumberSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val === '' || /^[A-Z]{2}[A-Z0-9+*]+$/.test(val),
    'Le numéro TVA invalide (format: XX + chiffres/lettres)'
  );

// ============================================
// SCHÉMAS COMPOSÉS (COMMON FORMS)
// ============================================

/**
 * Schéma de connexion
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional()
});

/**
 * Schéma d'inscription
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  organizationName: organizationNameSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

/**
 * Schéma de création d'organisation
 */
export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  industry: z.string().optional(),
  website: websiteUrlSchema,
  description: descriptionSchema.optional(),
  numberTeam: z.string().optional()
});

/**
 * Schéma de création de marque
 */
export const createBrandSchema = z.object({
  name: brandNameSchema,
  description: descriptionSchema.optional(),
  website: websiteUrlSchema,
  keywords: keywordsSchema,
  color: z.string().optional()
});

/**
 * Schéma de création de source
 */
export const createSourceSchema = z.object({
  type: z.enum(['TWITTER', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'GOOGLE_REVIEWS', 'TRUSTPILOT', 'TRIPADVISOR', 'YOUTUBE', 'REDDIT', 'NEWS', 'BLOG', 'FORUM', 'RSS', 'REVIEW', 'OTHER']),
  name: z.string().min(1, 'Le nom est requis').max(100),
  url: sourceUrlSchema.optional(),
  username: z.string().optional(),
  accessToken: z.string().optional(),
  scrapingFrequency: scrapingFrequencySchema.optional()
});

/**
 * Schéma de création d'alerte
 */
export const createAlertSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'alerte est requis').max(100),
  description: descriptionSchema.optional(),
  condition: z.enum(['NEGATIVE_SENTIMENT_THRESHOLD', 'KEYWORD_FREQUENCY', 'MENTION_SPIKE', 'SENTIMENT_DROP', 'CUSTOM']),
  threshold: alertThresholdSchema,
  level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  isActive: z.boolean().optional()
});

/**
 * Schéma de modification du profil utilisateur
 */
export const updateProfileSchema = z.object({
  firstName: firstNameSchema.optional(),
  lastName: lastNameSchema.optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  phone: phoneSchema
});

/**
 * Schéma de changement de mot de passe
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'La confirmation est requise')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmNewPassword']
});

/**
 * Schéma de oubli de mot de passe (demande de reset)
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

/**
 reset de mot de * Schéma de passe
 */
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema(z.string().min(1, 'Le mot de passe est requis'))
});

// ============================================
// TYPES EXPORTÉES
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
export type CreateBrandFormData = z.infer<typeof createBrandSchema>;
export type CreateSourceFormData = z.infer<typeof createSourceSchema>;
export type CreateAlertFormData = z.infer<typeof createAlertSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// MESSAGES D'ERREUR PERSONNALISÉS
// ============================================

/**
 * Messages d'erreur traduits et friendly pour l'affichage
 */
export const ERROR_MESSAGES = {
  // Champs requis
  required: 'Ce champ est obligatoire',
  
  // Email
  email: {
    invalid: 'Adresse email invalide',
    tooLong: 'L\'email ne peut pas dépasser 255 caractères'
  },
  
  // Mot de passe
  password: {
    tooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    needsUppercase: 'Le mot de passe doit contenir au moins une majuscule',
    needsLowercase: 'Le mot de passe doit contenir au moins une minuscule',
    needsNumber: 'Le mot de passe doit contenir au moins un chiffre',
    needsSpecial: 'Le mot de passe doit contenir au moins un caractère spécial',
    mismatch: 'Les mots de passe ne correspondent pas'
  },
  
  // Nom
  name: {
    tooShort: 'Ce champ doit contenir au moins 2 caractères',
    tooLong: 'Ce champ ne peut pas dépasser 100 caractères',
    invalid: 'Ce champ ne peut contenir que des lettres'
  },
  
  // URL
  url: {
    invalid: 'URL invalide',
    mustBeHttp: 'L\'URL doit commencer par http:// ou https://'
  },
  
  // Numéro
  phone: {
    invalid: 'Numéro de téléphone invalide'
  },
  
  // Tableau
  array: {
    tooShort: 'Veuillez ajouter au moins un élément',
    tooLong: 'Vous avez atteint le maximum d\'éléments autorisés'
  },
  
  // Générique
  generic: {
    serverError: 'Une erreur serveur s\'est produite. Veuillez réessayer.',
    networkError: 'Erreur de connexion. Vérifiez votre connexion Internet.',
    unauthorized: 'Session expirée. Veuillez vous reconnecter.',
    forbidden: 'Vous n\'avez pas les permissions nécessaires.',
    notFound: 'Ressource non trouvée.',
    rateLimit: 'Trop de requêtes. Veuillez patienter quelques instants.'
  }
};
