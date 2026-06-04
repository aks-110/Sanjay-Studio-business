import { Router } from 'express';
import { galleryController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.get('/', galleryController.list); // Public viewable
router.post('/', verifyToken, checkPermission('gallery:write'), galleryController.create);
router.delete('/:id', verifyToken, checkPermission('gallery:write'), galleryController.delete);

export default router;
