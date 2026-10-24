import { Request, Response, NextFunction } from 'express';
import { districtService, DistrictService } from '../services/district.service.js';

export class DistrictController {
  constructor(private district: DistrictService = districtService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const districtId = (req.query.districtId as string) || req.user?.districtId || undefined;
      const dashboard = await this.district.getDistrictDashboard(districtId);
      res.status(200).json(dashboard);
    } catch (err) {
      next(err);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const districtId = (req.query.districtId as string) || req.user?.districtId || undefined;
      const csv = await this.district.exportSchoolsCsv(districtId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="district-schools.csv"');
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  };
}

export const districtController = new DistrictController();
