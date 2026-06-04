import { Router } from 'express';
import { analyticsController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.get('/dashboard', verifyToken, checkPermission('analytics:read'), analyticsController.getStats);

export default router;
