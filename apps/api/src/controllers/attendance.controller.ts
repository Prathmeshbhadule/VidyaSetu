import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { attendanceService, AttendanceService } from '../services/attendance.service.js';

const MarkAttendanceSchema = z.object({
  schoolId: z.string().min(1),
  studentId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: z.enum(['PRESENT', 'ABSENT', 'LEAVE']),
  markedBy: z.string().min(1),
  source: z.enum(['TEACHER', 'DEVICE_AUTO']).default('TEACHER'),
  note: z.string().optional(),
  deviceId: z.string().optional(),
  hlc: z.string().optional(),
});

const BulkAttendanceSchema = z.object({
  schoolId: z.string().min(1),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(['PRESENT', 'ABSENT', 'LEAVE']),
      markedBy: z.string().min(1),
      source: z.enum(['TEACHER', 'DEVICE_AUTO']).default('TEACHER'),
      note: z.string().optional(),
      deviceId: z.string().optional(),
      hlc: z.string().optional(),
    })
  ),
});

export class AttendanceController {
  constructor(private attendance: AttendanceService = attendanceService) {}

  mark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = MarkAttendanceSchema.parse(req.body);
      const record = await this.attendance.markAttendance(data);
      res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  };

  bulkMark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId, records } = BulkAttendanceSchema.parse(req.body);
      const updated = await this.attendance.bulkMarkAttendance(schoolId, records);
      res.status(200).json({ updatedCount: updated.length, records: updated });
    } catch (err) {
      next(err);
    }
  };

  getGrid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = (req.query.schoolId as string) || req.user?.schoolId;
      if (!schoolId) {
        res.status(400).json({ status: 400, title: 'Bad Request', detail: 'schoolId is required' });
        return;
      }

      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

      const grid = await this.attendance.getAttendanceGrid(schoolId, grade, days);
      res.status(200).json(grid);
    } catch (err) {
      next(err);
    }
  };
}

export const attendanceController = new AttendanceController();
