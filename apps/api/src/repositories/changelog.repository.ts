import { prisma } from '../db/prisma.js';
import { ChangeLog, Prisma, SyncOp } from '@prisma/client';

export class ChangeLogRepository {
  async create(data: {
    id: string;
    entity: string;
    entityId: string;
    op: SyncOp;
    schoolId: string;
    deviceId: string;
    payload: Record<string, unknown>;
    hlc: string;
  }): Promise<ChangeLog> {
    return prisma.changeLog.create({
      data: {
        id: data.id,
        entity: data.entity,
        entityId: data.entityId,
        op: data.op,
        schoolId: data.schoolId,
        deviceId: data.deviceId,
        payload: data.payload as any,
        hlc: data.hlc,
        receivedAt: new Date(),
      },
    });
  }

  async findSince(sinceSeq: number, limit: number = 100, schoolId?: string): Promise<ChangeLog[]> {
    return prisma.changeLog.findMany({
      where: {
        seq: { gt: sinceSeq },
        ...(schoolId ? { schoolId } : {}),
      },
      take: limit,
      orderBy: { seq: 'asc' },
    });
  }

  async getLatestSeq(schoolId?: string): Promise<number> {
    const latest = await prisma.changeLog.findFirst({
      where: {
        ...(schoolId ? { schoolId } : {}),
      },
      orderBy: { seq: 'desc' },
      select: { seq: true },
    });

    return latest?.seq ?? 0;
  }
}

export const changeLogRepository = new ChangeLogRepository();
