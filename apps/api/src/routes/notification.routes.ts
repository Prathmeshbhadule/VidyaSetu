import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.post('/dispatch', requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), notificationController.dispatch);
notificationRouter.get('/', notificationController.list);
