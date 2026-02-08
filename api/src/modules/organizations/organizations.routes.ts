import { Router } from 'express';
import { organizationController } from './organizations.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createOrganizationSchema, updateOrganizationSchema } from '../../shared/validators/schemas';

/**
 * 🛣️ Routes organizations
 * 
 * Définit les endpoints HTTP pour gérer les organizations
 */
const router: Router = Router();

/**
 * @route   GET /api/v1/organizations
 * @desc    Récupérer toutes les organizations
 * @access  Public (pour l'instant)
 * 
 * 📝 Note : Plus tard, tu ajouteras un middleware d'authentification :
 * router.get('/', authenticateUser, organizationsController.getAllOrganizations);
 */
router.get('/', organizationController.getAllOrganizations.bind(organizationController));


/**
 * @route   GET /api/v1/organizations/:id
 * @desc    Récupérer une organization par son ID
 * @access  Public
 * 
 * :id est un paramètre dynamique (peut être 1, 2, abc, etc.)
 */
router.get('/:id', organizationController.getOrganizationById.bind(organizationController));

/**
 * @route   POST /api/v1/organizations
 * @desc    Créer une nouvelle organization
 * @access  Public
 * 
 * Body attendu :
 * {
 *   "name": "Le Monde",
 *   "industry": "Game",
 *   "numberTeam": "only-one",
 *   "subscriptionTier": 'FREE'  // Optionnel
 * }
 */
router.post('/', validate(createOrganizationSchema), organizationController.createOrganization.bind(organizationController));

/**
 * @route   PATCH /api/v1/organizations/:id
 * @desc    Mettre à jour une organization (modification partielle)
 * @access  Public
 * 
 * 💡 PATCH vs PUT :
 * - PATCH : Modification partielle (on envoie seulement les champs à changer)
 * - PUT : Remplacement complet (on doit envoyer TOUS les champs)
 * 
 * On utilise PATCH car c'est plus pratique
 * 
 * Body attendu (exemple) :
 * {
 *   "isActive": false
 * }
 */
router.patch('/:id', validate(updateOrganizationSchema), organizationController.updateOrganization.bind(organizationController));

/**
 * @route   DELETE /api/v1/organizations/:id
 * @desc    Supprimer une organization
 * @access  Public
 */
router.delete('/:id', organizationController.deleteOrganization.bind(organizationController));

export default router;
