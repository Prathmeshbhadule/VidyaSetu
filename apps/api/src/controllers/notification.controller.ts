import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { notificationService, NotificationService } from '../services/notification.service.js';

const DispatchNotificationSchema = z.object({
  schoolId: z.string().min(1),
  recipientId: z.string().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().nullable().optional(),
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  hasOnDeviceSession: z.boolean().optional(),
});

export class NotificationController {
  constructor(private notifications: NotificationService = notificationService) {}

  dispatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = DispatchNotificationSchema.parse(req.body);
      const record = await this.notifications.dispatchTieredNotification(data);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = (req.query.schoolId as string) || req.user?.schoolId || undefined;
      const recipientId = req.query.recipientId as string;
      const records = await this.notifications.listNotifications(schoolId, recipientId);
      res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  };
}

export const notificationController = new NotificationController();
