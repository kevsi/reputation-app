
import { Router } from 'express';
import { keywordsController } from './keywords.controller';
import { requireAuth } from '../../shared/middleware/auth.middleware';

const router: Router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour les mots-clés d'une marque spécifique
router.get('/brand/:brandId', keywordsController.getKeywordsByBrand.bind(keywordsController));
router.post('/brand/:brandId', keywordsController.addKeywordToBrand.bind(keywordsController));
router.delete('/brand/:brandId', keywordsController.removeKeywordFromBrand.bind(keywordsController));

// Route générale pour récupérer les mots-clés d'une marque (via query param brandId)
router.get('/', keywordsController.getKeywords.bind(keywordsController));

// Route générale pour créer un mot-clé (avec brandId dans le body)
router.post('/', keywordsController.createKeyword.bind(keywordsController));

export default router;

