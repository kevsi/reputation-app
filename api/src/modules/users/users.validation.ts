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
const userTypeEnum = z.enum(['owner', 'admin', 'member', 'viewer']);

/**
 * Validation pour la création d'un user
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  password: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  role: userTypeEnum,

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * Validation pour la mise à jour d'une source
 * Tous les champs sont optionnels
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),

  password: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),

  role: userTypeEnum.optional(),

  isActive: z
    .boolean()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Type inféré automatiquement depuis le schéma Zod
 * Plus besoin de définir manuellement CreateUserInput !
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;