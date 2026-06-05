import express, { Router } from 'express';
import { authController } from './controllers.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/clerk-sync', authController.clerkSync);
router.post('/webhook/clerk', express.raw({ type: 'application/json' }), authController.clerkWebhook);

export default router;

