import { Router } from 'express';
import { notificationController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';

const router = Router();

router.get('/', verifyToken, notificationController.getMyNotifications);
router.patch('/:id/read', verifyToken, notificationController.markRead);

export default router;
