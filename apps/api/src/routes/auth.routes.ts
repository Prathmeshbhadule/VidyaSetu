import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/refresh', authController.refreshToken);
authRouter.post('/verify-pin', authController.verifyPin);
authRouter.post('/pair-device', authenticate, requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), authController.pairDevice);
authRouter.post('/logout', authController.logout);
