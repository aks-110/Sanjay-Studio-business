import { Router } from 'express';
import { ecommerceController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';
import { checkPermission } from '../../shared/middleware/permissions.js';

const router = Router();

// Guest and customer read catalogs
router.get('/products', ecommerceController.getProducts);

// Secured ordering endpoints
router.post('/orders', verifyToken, checkPermission('orders:create'), ecommerceController.createOrder);
router.get('/orders', verifyToken, ecommerceController.getOrders); // Scopes access internally
router.patch('/orders/:orderId/status', verifyToken, checkPermission('products:write'), ecommerceController.updateStatus);

export default router;
