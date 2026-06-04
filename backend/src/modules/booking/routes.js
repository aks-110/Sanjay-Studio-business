import { Router } from 'express';
import { bookingController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.post('/', verifyToken, checkPermission('bookings:create'), bookingController.create);
router.get('/', verifyToken, bookingController.list); // Scoping logic handled inside the service
router.patch('/:bookingId/status', verifyToken, checkPermission('bookings:write-status'), bookingController.updateStatus);

export default router;
