import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

export const contentRouter = Router();

// Public / student read endpoints
contentRouter.get('/lessons', optionalAuthenticate, contentController.listLessons);
contentRouter.get('/lessons/:id', optionalAuthenticate, contentController.getLessonById);
contentRouter.get('/packs/latest', optionalAuthenticate, contentController.getLatestPack);

// Admin content management
contentRouter.post('/lessons', authenticate, requireRole('CONTENT_ADMIN'), contentController.createLesson);
contentRouter.put('/lessons/:id', authenticate, requireRole('CONTENT_ADMIN'), contentController.updateLesson);
contentRouter.post('/packs/publish', authenticate, requireRole('CONTENT_ADMIN'), contentController.publishPack);
