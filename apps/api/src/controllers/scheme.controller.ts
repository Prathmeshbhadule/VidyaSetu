import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { schemeService, SchemeService } from '../services/scheme.service.js';

const UpdateChecklistSchema = z.object({
  studentId: z.string().min(1),
  schemeId: z.string().min(1),
  checkedDocs: z.array(z.string()),
});

export class SchemeController {
  constructor(private schemes: SchemeService = schemeService) {}

  listSchemes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const girlSpecific = req.query.girlSpecific !== undefined
        ? req.query.girlSpecific === 'true'
        : undefined;

      const schemes = await this.schemes.listSchemes(girlSpecific);
      res.status(200).json(schemes);
    } catch (err) {
      next(err);
    }
  };

  getSchemeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const scheme = await this.schemes.getSchemeById(req.params.id);
      res.status(200).json(scheme);
    } catch (err) {
      next(err);
    }
  };

  checkEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schemeId, studentId } = req.params;
      const evaluation = await this.schemes.checkEligibility(schemeId, studentId);
      res.status(200).json(evaluation);
    } catch (err) {
      next(err);
    }
  };

  getChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schemeId, studentId } = req.params;
      const checklist = await this.schemes.getStudentChecklist(studentId, schemeId);
      res.status(200).json(checklist);
    } catch (err) {
      next(err);
    }
  };

  updateChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = UpdateChecklistSchema.parse(req.body);
      const updated = await this.schemes.updateChecklistProgress(data);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  listFacilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const districtId = req.query.districtId as string;
      const facilities = await this.schemes.listFacilities(districtId);
      res.status(200).json(facilities);
    } catch (err) {
      next(err);
    }
  };
}

export const schemeController = new SchemeController();
