import { prisma } from '../db/prisma.js';
import { AuditLog } from '@prisma/client';

export class AuditRepository {
  async log(entry: {
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details as any,
        ipAddress: entry.ipAddress,
      },
    });
  }

  async findMany(limit: number = 100): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const auditRepository = new AuditRepository();
