import { prisma } from '../db/prisma.js';
import { AtRiskFlag, Prisma } from '@prisma/client';

export interface AtRiskFilter {
  schoolId?: string;
  studentId?: string;
  resolved?: boolean;
}

export class AtRiskRepository {
  async findMany(filter: AtRiskFilter = {}): Promise<AtRiskFlag[]> {
    return prisma.atRiskFlag.findMany({
      where: {
        deletedAt: null,
        ...(filter.schoolId ? { schoolId: filter.schoolId } : {}),
        ...(filter.studentId ? { studentId: filter.studentId } : {}),
        ...(filter.resolved !== undefined
          ? filter.resolved
            ? { resolvedAt: { not: null } }
            : { resolvedAt: null }
          : {}),
      },
      include: {
        student: true,
      },
      orderBy: { raisedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<AtRiskFlag | null> {
    return prisma.atRiskFlag.findUnique({
      where: { id },
      include: { student: true },
    });
  }

  async upsert(data: Prisma.AtRiskFlagUncheckedCreateInput): Promise<AtRiskFlag> {
    return prisma.atRiskFlag.upsert({
      where: { id: data.id },
      create: data,
      update: {
        reason: data.reason,
        ruleId: data.ruleId,
        attendancePercent: data.attendancePercent,
        consecutiveAbsences: data.consecutiveAbsences,
        suggestedSchemeIds: data.suggestedSchemeIds as any,
        resolvedAt: data.resolvedAt,
        resolvedBy: data.resolvedBy,
        note: data.note,
        hlc: data.hlc,
        deviceId: data.deviceId,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async resolveFlag(id: string, resolvedBy: string, note?: string): Promise<AtRiskFlag> {
    return prisma.atRiskFlag.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        resolvedBy,
        note,
        updatedAt: new Date(),
      },
    });
  }
}

export const atRiskRepository = new AtRiskRepository();
