import { Router } from 'express';
import { inventoryController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.get('/', verifyToken, checkPermission('inventory:read'), inventoryController.list);
router.post('/', verifyToken, checkPermission('inventory:write'), inventoryController.create);
router.put('/:id', verifyToken, checkPermission('inventory:write'), inventoryController.update);
router.delete('/:id', verifyToken, checkPermission('inventory:write'), inventoryController.delete);

export default router;
