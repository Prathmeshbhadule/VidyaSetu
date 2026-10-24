import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export class HealthController {
  healthz = (req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok', service: 'vidya-setu-api', uptimeSec: process.uptime() });
  };

  readyz = async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(503).json({ status: 'unavailable', database: 'disconnected', error: err.message });
    }
  };
}

export const healthController = new HealthController();
