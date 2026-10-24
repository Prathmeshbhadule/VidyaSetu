import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, enforceSchoolTenant } from '../middleware/rbac.js';

export const studentRouter = Router();

// Student routes are protected by authentication & role/tenant checks
studentRouter.use(authenticate);

studentRouter.get('/', enforceSchoolTenant(), studentController.list);
studentRouter.get('/:id', studentController.getById);
studentRouter.post('/', requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), enforceSchoolTenant(), studentController.create);
studentRouter.put('/:id', requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), studentController.update);
studentRouter.get('/:id/export', studentController.exportData); // DPDP Act Right to Portability
studentRouter.delete('/:id', requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), studentController.delete); // DPDP Act Erasure
