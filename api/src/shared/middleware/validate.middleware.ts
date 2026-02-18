// src/shared/middleware/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { Logger } from '../../shared/logger';

/**
 * 🛡️ Middleware de validation générique
 * 
 * Utilise Zod pour valider le body, params, ou query d'une requête
 * 
 * @param schema - Schéma Zod à utiliser pour la validation
 * @returns Middleware Express
 * 
 * @example
 * router.post('/', validate(createSourceSchema), controller.create);
 */
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valider le body de la requête
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formater les erreurs Zod de manière lisible
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        Logger.warn('Erreur de validation', { errors, composant: 'ValidateMiddleware', operation: 'validate' });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      return next(error);
    }
  };
};

/**
 * 🔍 Variante pour valider les paramètres d'URL
 * 
 * @example
 * router.get('/:id', validateParams(idParamSchema), controller.getById);
 */
export const validateParams = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Invalid URL parameters',
          errors,
        });
      }
      return next(error);
    }
  };
};

/**
 * 🔍 Variante pour valider les query strings
 * 
 * @example
 * router.get('/', validateQuery(listQuerySchema), controller.list);
 */
export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors,
        });
      }
      return next(error);
    }
  };
};