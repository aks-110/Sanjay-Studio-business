import { Router } from 'express';
import { crmController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

router.get('/', verifyToken, checkPermission('crm:read'), crmController.list);
router.put('/:id', verifyToken, checkPermission('crm:write'), crmController.update);

export default router;
