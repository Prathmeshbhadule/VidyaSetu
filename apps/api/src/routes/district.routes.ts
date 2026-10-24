import { Router } from 'express';
import { districtController } from '../controllers/district.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

export const districtRouter = Router();

districtRouter.use(authenticate);
districtRouter.use(requireRole('DISTRICT_ADMIN', 'CONTENT_ADMIN'));

districtRouter.get('/dashboard', districtController.getDashboard);
districtRouter.get('/export/csv', districtController.exportCsv);
