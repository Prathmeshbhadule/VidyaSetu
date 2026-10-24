import { prisma } from '../db/prisma.js';
import { NotificationRecord, Prisma } from '@prisma/client';

export class NotificationRepository {
  async findMany(schoolId?: string, recipientId?: string): Promise<NotificationRecord[]> {
    return prisma.notificationRecord.findMany({
      where: {
        deletedAt: null,
        ...(schoolId ? { schoolId } : {}),
        ...(recipientId ? { recipientId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    return prisma.notificationRecord.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.NotificationRecordUncheckedCreateInput): Promise<NotificationRecord> {
    return prisma.notificationRecord.create({ data });
  }

  async update(id: string, data: Prisma.NotificationRecordUncheckedUpdateInput): Promise<NotificationRecord> {
    return prisma.notificationRecord.update({
      where: { id },
      data,
    });
  }
}

export const notificationRepository = new NotificationRepository();
