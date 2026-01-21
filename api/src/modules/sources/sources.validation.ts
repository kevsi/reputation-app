// src/modules/sources/sources.validation.ts

import { z } from 'zod';

/**
 * 🛡️ Schémas de validation Zod
 * 
 * Zod permet de valider les données entrantes de manière type-safe
 * 
 * Installation : npm install zod
 */

/**
 * Types de source autorisés
 */
const sourceTypeEnum = z.enum(['website', 'social_media', 'news', 'forum']);

/**
 * Validation pour la création d'une source
 */
export const createSourceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  url: z
    .string()
    .url('Invalid URL format')
    .trim(),
  
  type: sourceTypeEnum,
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * Validation pour la mise à jour d'une source
 * Tous les champs sont optionnels
 */
export const updateSourceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  
  url: z
    .string()
    .url('Invalid URL format')
    .trim()
    .optional(),
  
  type: sourceTypeEnum.optional(),
  
  isActive: z
    .boolean()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Type inféré automatiquement depuis le schéma Zod
 * Plus besoin de définir manuellement CreateSourceInput !
 */
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;