import { prisma } from '../db/prisma.js';
import { Quiz, Question, Prisma } from '@prisma/client';

export class QuizRepository {
  async findMany(lessonId?: string): Promise<Quiz[]> {
    return prisma.quiz.findMany({
      where: {
        deletedAt: null,
        ...(lessonId ? { lessonId } : {}),
      },
      include: {
        questions: true,
      },
    });
  }

  async findById(id: string): Promise<Quiz | null> {
    return prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
  }

  async upsert(data: Prisma.QuizUncheckedCreateInput, questions: Prisma.QuestionUncheckedCreateInput[] = []): Promise<Quiz> {
    const quiz = await prisma.quiz.upsert({
      where: { id: data.id },
      create: data,
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });

    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        create: { ...q, quizId: quiz.id },
        update: {
          type: q.type,
          prompt: q.prompt,
          promptAudioUrl: q.promptAudioUrl,
          promptImageUrl: q.promptImageUrl,
          options: q.options as any,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
          level: q.level,
          marks: q.marks,
        },
      });
    }

    return this.findById(quiz.id) as Promise<Quiz>;
  }

  async findQuestionsByLevel(level: number, limit: number = 10): Promise<Question[]> {
    return prisma.question.findMany({
      where: { level },
      take: limit,
    });
  }
}

export const quizRepository = new QuizRepository();
