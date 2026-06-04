import { Router } from 'express';
import { reviewsController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.get('/:entityType/:entityId', reviewsController.list);
router.post('/', verifyToken, checkPermission('orders:create'), reviewsController.add); // customer scope

export default router;
