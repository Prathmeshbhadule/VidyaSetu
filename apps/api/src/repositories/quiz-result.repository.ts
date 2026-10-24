import { prisma } from '../db/prisma.js';
import { QuizResult, Prisma } from '@prisma/client';

export interface QuizResultFilter {
  studentId?: string;
  quizId?: string;
  schoolId?: string;
}

export class QuizResultRepository {
  async findMany(filter: QuizResultFilter = {}): Promise<QuizResult[]> {
    return prisma.quizResult.findMany({
      where: {
        deletedAt: null,
        ...(filter.studentId ? { studentId: filter.studentId } : {}),
        ...(filter.quizId ? { quizId: filter.quizId } : {}),
        ...(filter.schoolId ? { schoolId: filter.schoolId } : {}),
      },
      include: {
        student: true,
        quiz: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<QuizResult | null> {
    return prisma.quizResult.findUnique({
      where: { id },
      include: {
        student: true,
        quiz: { include: { questions: true } },
      },
    });
  }

  // Quiz results are append-only and immutable
  async create(data: Prisma.QuizResultUncheckedCreateInput): Promise<QuizResult> {
    const existing = await prisma.quizResult.findUnique({ where: { id: data.id } });
    if (existing) {
      return existing; // idempotent deduplication
    }

    return prisma.quizResult.create({ data });
  }
}

export const quizResultRepository = new QuizResultRepository();
