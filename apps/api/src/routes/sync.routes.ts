import { Router } from 'express';
import { syncController } from '../controllers/sync.controller.js';
import { authenticate } from '../middleware/auth.js';

export const syncRouter = Router();

// Sync endpoints authenticate via JWT or paired device token
syncRouter.post('/push', authenticate, syncController.push);
syncRouter.get('/pull', authenticate, syncController.pull);
