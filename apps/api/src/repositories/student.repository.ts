import { prisma } from '../db/prisma.js';
import { StudentProfile, Prisma } from '@prisma/client';

export interface StudentFilter {
  schoolId?: string;
  grade?: number;
  limit?: number;
  cursor?: string;
  search?: string;
}

export class StudentRepository {
  async findMany(filter: StudentFilter = {}): Promise<StudentProfile[]> {
    const { schoolId, grade, limit = 100, cursor, search } = filter;

    return prisma.studentProfile.findMany({
      where: {
        deletedAt: null,
        ...(schoolId ? { schoolId } : {}),
        ...(grade ? { grade } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { prn: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<StudentProfile | null> {
    return prisma.studentProfile.findUnique({
      where: { id },
      include: {
        school: true,
        atRiskFlags: { where: { deletedAt: null } },
        checklist: { where: { deletedAt: null } },
      },
    });
  }

  async findByPrn(prn: string): Promise<StudentProfile | null> {
    return prisma.studentProfile.findUnique({
      where: { prn },
    });
  }

  async upsert(data: Prisma.StudentProfileUncheckedCreateInput): Promise<StudentProfile> {
    return prisma.studentProfile.upsert({
      where: { id: data.id },
      create: data,
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Prisma.StudentProfileUncheckedUpdateInput): Promise<StudentProfile> {
    return prisma.studentProfile.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<StudentProfile> {
    return prisma.studentProfile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<StudentProfile> {
    // DPDP Act: permanent deletion of student record
    return prisma.studentProfile.delete({
      where: { id },
    });
  }
}

export const studentRepository = new StudentRepository();
