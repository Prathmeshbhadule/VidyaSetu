import { prisma } from '../db/prisma.js';
import { TeacherProfile, Prisma } from '@prisma/client';

export class TeacherRepository {
  async findMany(schoolId?: string): Promise<TeacherProfile[]> {
    return prisma.teacherProfile.findMany({
      where: {
        deletedAt: null,
        ...(schoolId ? { schoolId } : {}),
      },
      include: {
        school: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<TeacherProfile | null> {
    return prisma.teacherProfile.findUnique({
      where: { id },
      include: { school: true },
    });
  }

  async findByTeacherId(teacherId: string): Promise<TeacherProfile | null> {
    return prisma.teacherProfile.findUnique({
      where: { teacherId },
      include: { school: true },
    });
  }

  async upsert(data: Prisma.TeacherProfileUncheckedCreateInput): Promise<TeacherProfile> {
    return prisma.teacherProfile.upsert({
      where: { id: data.id },
      create: data,
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}

export const teacherRepository = new TeacherRepository();
