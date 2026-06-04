import { Router } from 'express';
import { paymentController } from './controllers.js';
import { verifyToken } from '../../shared/middleware/auth.js';

const router = Router();

// Checkout initiation and confirmation
router.post('/checkout', verifyToken, paymentController.initCheckout);
router.post('/confirm', verifyToken, paymentController.confirmPayment);

// Billing invoices directory
router.get('/invoices', verifyToken, paymentController.getInvoices);

export default router;
