import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { studentService, StudentService } from '../services/student.service.js';

const CreateStudentSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  prn: z.string().min(1),
  grade: z.coerce.number().int().min(1).max(12),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  avatarId: z.string().optional(),
  pin: z.string().length(4),
  parentalConsent: z.boolean().default(true),
});

const UpdateStudentSchema = z.object({
  name: z.string().optional(),
  grade: z.coerce.number().int().min(1).max(12).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  assessedLevel: z.coerce.number().int().min(1).max(5).optional(),
  avatarId: z.string().optional(),
  pin: z.string().length(4).optional(),
  parentalConsent: z.boolean().optional(),
});

export class StudentController {
  constructor(private students: StudentService = studentService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = {
        schoolId: (req.query.schoolId as string) || req.user?.schoolId || undefined,
        grade: req.query.grade ? parseInt(req.query.grade as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
        cursor: req.query.cursor as string,
        search: req.query.search as string,
      };

      const result = await this.students.listStudents(filter);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.students.getStudentById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = CreateStudentSchema.parse(req.body);
      const student = await this.students.createStudent(data);
      res.status(201).json(student);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = UpdateStudentSchema.parse(req.body);
      const student = await this.students.updateStudent(req.params.id, data);
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  exportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exportBundle = await this.students.exportStudentData(req.params.id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="student-export-${req.params.id}.json"`);
      res.status(200).json(exportBundle);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await this.students.deleteStudent(req.params.id);
      res.status(200).json({ message: 'Student data removed in compliance with DPDP Act 2023', deleted });
    } catch (err) {
      next(err);
    }
  };
}

export const studentController = new StudentController();
