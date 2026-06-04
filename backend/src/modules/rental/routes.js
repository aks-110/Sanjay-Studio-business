import { Router } from 'express';
import { rentalController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.post('/', verifyToken, checkPermission('rentals:create'), rentalController.create);
router.get('/', verifyToken, rentalController.list); // Scopes access internally
router.patch('/:rentalId/status', verifyToken, checkPermission('rentals:write'), rentalController.updateStatus);

export default router;
