import { notificationRepository, NotificationRepository } from '../repositories/notification.repository.js';
import { getSmsProvider } from '../notifications/adapter.js';
import {
  NotificationChannel,
  generateUuidV7,
  StandardProblems,
  ProblemError,
} from '@vidya-setu/shared';

export interface SendNotificationOptions {
  schoolId: string;
  recipientId: string;
  recipientName: string;
  recipientPhone?: string | null;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  hasOnDeviceSession?: boolean; // Is the student currently logged in on a device?
}

export class NotificationService {
  constructor(private notifications: NotificationRepository = notificationRepository) {}

  /**
   * Dispatches a tiered parent notification according to the 4-tier priority rules:
   * (1) on-device notice shown to student
   * (2) printable slip (PDF)
   * (3) SMS/IVR through provider-agnostic adapter
   * (4) weekly community notice-board
   */
  async dispatchTieredNotification(options: SendNotificationOptions) {
    const channelsTried: NotificationChannel[] = [];
    let channelUsed: NotificationChannel | null = null;
    let deliveredAt: Date | null = null;

    // Tier 1: On-device notice if student/user is active on tablet
    channelsTried.push('ON_DEVICE');
    if (options.hasOnDeviceSession) {
      channelUsed = 'ON_DEVICE';
      deliveredAt = new Date();
    }

    // Tier 2: Printable/handwritten slip (PDF generated for teacher to give student)
    if (!channelUsed) {
      channelsTried.push('PRINT_SLIP');
      // If student is present in school or slip printed
      channelUsed = 'PRINT_SLIP';
      deliveredAt = new Date();
    }

    // Tier 3: SMS attempt if phone number is available
    if (options.recipientPhone && options.recipientPhone.trim().length >= 10) {
      channelsTried.push('SMS');
      const smsProvider = getSmsProvider();
      const smsResult = await smsProvider.sendSms(options.recipientPhone, `${options.title}: ${options.message}`);
      if (smsResult.success) {
        channelUsed = 'SMS';
        deliveredAt = new Date();
      }
    }

    // Tier 4: Community Notice Board fallback
    if (!channelUsed) {
      channelsTried.push('COMMUNITY_BOARD');
      channelUsed = 'COMMUNITY_BOARD';
      deliveredAt = new Date();
    }

    const id = generateUuidV7();
    const record = await this.notifications.create({
      id,
      schoolId: options.schoolId,
      recipientId: options.recipientId,
      recipientName: options.recipientName,
      recipientPhone: options.recipientPhone,
      type: options.type,
      title: options.title,
      message: options.message,
      channelsTried,
      channelUsed,
      status: channelUsed ? 'DELIVERED' : 'FAILED',
      deliveredAt,
      metadata: options.metadata as any,
      deviceId: 'cloud',
      version: 1,
    });

    return record;
  }

  async listNotifications(schoolId?: string, recipientId?: string) {
    return this.notifications.findMany(schoolId, recipientId);
  }
}

export const notificationService = new NotificationService();
