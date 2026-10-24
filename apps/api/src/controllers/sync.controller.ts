import { Request, Response, NextFunction } from 'express';
import { SyncPushPayloadSchema, SyncPullQuerySchema } from '@vidya-setu/shared';
import { syncService, SyncService } from '../services/sync.service.js';

export class SyncController {
  constructor(private sync: SyncService = syncService) {}

  push = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = SyncPushPayloadSchema.parse(req.body);
      const pushResponse = await this.sync.pushChanges(payload);
      res.status(200).json(pushResponse);
    } catch (err) {
      next(err);
    }
  };

  pull = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = SyncPullQuerySchema.parse(req.query);
      const pullResponse = await this.sync.pullChanges(query);
      res.status(200).json(pullResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const syncController = new SyncController();
