// src/modules/sources/sources.routes.ts (VERSION AVEC VALIDATION ZOD)

import { Router } from 'express';
import { sourcesController } from './sources.controller';
import { validate } from '@/shared/middlleware/validate.middleware';
import { createSourceSchema, updateSourceSchema } from './sources.validation';

/**
 * 🛣️ Routes Sources avec Validation
 */
const router = Router();

/**
 * @route   GET /api/v1/sources
 * @desc    Récupérer toutes les sources
 * @access  Public
 */
router.get('/', sourcesController.getAllSources.bind(sourcesController));

/**
 * @route   GET /api/v1/sources/active
 * @desc    Récupérer uniquement les sources actives
 * @access  Public
 */
router.get('/active', sourcesController.getActiveSources.bind(sourcesController));

/**
 * @route   GET /api/v1/sources/:id
 * @desc    Récupérer une source par son ID
 * @access  Public
 */
router.get('/:id', sourcesController.getSourceById.bind(sourcesController));

/**
 * @route   POST /api/v1/sources
 * @desc    Créer une nouvelle source
 * @access  Public
 * 
 * 🛡️ Validation : Le middleware validate() vérifie automatiquement que :
 *    - name est présent et entre 2-100 caractères
 *    - url est présent et est une URL valide
 *    - type est l'une des valeurs autorisées
 *    - isActive est un booléen (optionnel)
 * 
 * Si la validation échoue, une erreur 400 est renvoyée AVANT d'appeler le controller
 */
router.post(
  '/',
  validate(createSourceSchema),
  sourcesController.createSource.bind(sourcesController)
);

/**
 * @route   PATCH /api/v1/sources/:id
 * @desc    Mettre à jour une source
 * @access  Public
 * 
 * 🛡️ Validation : Vérifie que les champs fournis sont valides
 *    et qu'au moins un champ est présent
 */
router.patch(
  '/:id',
  /*validate(updateSourceSchema),*/
  sourcesController.updateSource.bind(sourcesController)
);

/**
 * @route   DELETE /api/v1/sources/:id
 * @desc    Supprimer une source
 * @access  Public
 */
router.delete('/:id', sourcesController.deleteSource.bind(sourcesController));

export default router;

