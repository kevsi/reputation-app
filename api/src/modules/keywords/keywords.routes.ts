
import { Router } from 'express';
import { keywordsController } from './keywords.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createKeywordSchema, updateKeywordSchema } from './keywords.validation';

const router = Router();

router.get('/', keywordsController.getAllKeywords.bind(keywordsController));
router.get('/:id', keywordsController.getKeywordById.bind(keywordsController));
router.post('/', validate(createKeywordSchema), keywordsController.createKeyword.bind(keywordsController));
router.patch('/:id', validate(updateKeywordSchema), keywordsController.updateKeyword.bind(keywordsController));
router.delete('/:id', keywordsController.deleteKeyword.bind(keywordsController));

export default router;
