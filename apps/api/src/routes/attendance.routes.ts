import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, enforceSchoolTenant } from '../middleware/rbac.js';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

attendanceRouter.post('/mark', requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), enforceSchoolTenant(), attendanceController.mark);
attendanceRouter.post('/bulk', requireRole('TEACHER', 'CONTENT_ADMIN', 'DISTRICT_ADMIN'), enforceSchoolTenant(), attendanceController.bulkMark);
attendanceRouter.get('/grid', enforceSchoolTenant(), attendanceController.getGrid);
