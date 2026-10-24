import { prisma } from '../db/prisma.js';
import { Lesson, Prisma, LessonStatus } from '@prisma/client';

export interface LessonFilter {
  subject?: string;
  grade?: number;
  level?: number;
  status?: LessonStatus;
}

export class LessonRepository {
  async findMany(filter: LessonFilter = {}): Promise<Lesson[]> {
    return prisma.lesson.findMany({
      where: {
        deletedAt: null,
        ...(filter.subject ? { subject: filter.subject } : {}),
        ...(filter.grade ? { grade: filter.grade } : {}),
        ...(filter.level ? { level: filter.level } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      include: {
        videos: { where: { deletedAt: null } },
        quizzes: { where: { deletedAt: null } },
      },
      orderBy: [{ grade: 'asc' }, { level: 'asc' }],
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        videos: { where: { deletedAt: null } },
        quizzes: {
          where: { deletedAt: null },
          include: { questions: true },
        },
      },
    });
  }

  async upsert(data: Prisma.LessonUncheckedCreateInput): Promise<Lesson> {
    return prisma.lesson.upsert({
      where: { id: data.id },
      create: data,
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<Lesson> {
    return prisma.lesson.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

export const lessonRepository = new LessonRepository();
