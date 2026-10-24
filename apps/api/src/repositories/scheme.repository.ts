import { prisma } from '../db/prisma.js';
import { Scheme, Facility, SchemeChecklistProgress, Prisma } from '@prisma/client';

export class SchemeRepository {
  async findMany(girlSpecific?: boolean): Promise<Scheme[]> {
    return prisma.scheme.findMany({
      where: {
        deletedAt: null,
        ...(girlSpecific !== undefined ? { girlSpecific } : {}),
      },
      orderBy: [{ girlSpecific: 'desc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<Scheme | null> {
    return prisma.scheme.findUnique({
      where: { id },
    });
  }

  async upsert(data: Prisma.SchemeUncheckedCreateInput): Promise<Scheme> {
    return prisma.scheme.upsert({
      where: { id: data.id },
      create: data,
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async findFacilities(districtId?: string): Promise<Facility[]> {
    return prisma.facility.findMany({
      where: {
        ...(districtId ? { districtId } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findChecklistProgress(studentId: string, schemeId: string): Promise<SchemeChecklistProgress | null> {
    return prisma.schemeChecklistProgress.findUnique({
      where: {
        studentId_schemeId: { studentId, schemeId },
      },
    });
  }

  async findStudentChecklists(studentId: string): Promise<SchemeChecklistProgress[]> {
    return prisma.schemeChecklistProgress.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
    });
  }

  async upsertChecklistProgress(data: Prisma.SchemeChecklistProgressUncheckedCreateInput): Promise<SchemeChecklistProgress> {
    return prisma.schemeChecklistProgress.upsert({
      where: {
        studentId_schemeId: { studentId: data.studentId, schemeId: data.schemeId },
      },
      create: data,
      update: {
        checkedDocs: data.checkedDocs as any,
        completed: data.completed,
        hlc: data.hlc,
        deviceId: data.deviceId,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }
}

export const schemeRepository = new SchemeRepository();
