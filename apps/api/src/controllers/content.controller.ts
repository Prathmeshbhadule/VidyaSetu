import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { contentService, ContentService } from '../services/content.service.js';

const CreateLessonSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  grade: z.coerce.number().int().min(1).max(12),
  level: z.coerce.number().int().min(1).max(5).default(1),
  contentBlocks: z.array(z.record(z.unknown())),
  audioUrl: z.string().optional(),
  estimatedMinutes: z.coerce.number().int().default(15),
  translations: z.record(z.unknown()).optional(),
});

export class ContentController {
  constructor(private content: ContentService = contentService) {}

  listLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = {
        subject: req.query.subject as string,
        grade: req.query.grade ? parseInt(req.query.grade as string, 10) : undefined,
        level: req.query.level ? parseInt(req.query.level as string, 10) : undefined,
      };

      const lessons = await this.content.listLessons(filter);
      res.status(200).json(lessons);
    } catch (err) {
      next(err);
    }
  };

  getLessonById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lesson = await this.content.getLessonById(req.params.id);
      res.status(200).json(lesson);
    } catch (err) {
      next(err);
    }
  };

  createLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = CreateLessonSchema.parse(req.body);
      const lesson = await this.content.createLesson(data);
      res.status(201).json(lesson);
    } catch (err) {
      next(err);
    }
  };

  updateLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lesson = await this.content.updateLesson(req.params.id, req.body);
      res.status(200).json(lesson);
    } catch (err) {
      next(err);
    }
  };

  publishPack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pack = await this.content.publishContentPack();
      res.status(201).json(pack);
    } catch (err) {
      next(err);
    }
  };

  getLatestPack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pack = await this.content.getLatestContentPack();
      res.status(200).json(pack);
    } catch (err) {
      next(err);
    }
  };
}

export const contentController = new ContentController();
