import { Router } from 'express';
import { usersController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.get('/profile', verifyToken, usersController.getProfile);
router.put('/profile', verifyToken, usersController.updateProfile);

// Admin-only user directory access
router.get('/', verifyToken, checkPermission('users:read'), usersController.list);
router.put('/:userId/permissions', verifyToken, checkPermission('users:write'), usersController.updateRolePermissions);

export default router;
