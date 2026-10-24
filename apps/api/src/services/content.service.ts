import crypto from 'crypto';
import { lessonRepository, LessonRepository, LessonFilter } from '../repositories/lesson.repository.js';
import { quizRepository, QuizRepository } from '../repositories/quiz.repository.js';
import { schemeRepository, SchemeRepository } from '../repositories/scheme.repository.js';
import { prisma } from '../db/prisma.js';
import { generateUuidV7, StandardProblems, ProblemError } from '@vidya-setu/shared';

export class ContentService {
  constructor(
    private lessons: LessonRepository = lessonRepository,
    private quizzes: QuizRepository = quizRepository,
    private schemes: SchemeRepository = schemeRepository
  ) {}

  async listLessons(filter: LessonFilter) {
    return this.lessons.findMany(filter);
  }

  async getLessonById(id: string) {
    const lesson = await this.lessons.findById(id);
    if (!lesson) {
      throw new ProblemError(StandardProblems.notFound('Lesson', id));
    }
    return lesson;
  }

  async createLesson(data: {
    schoolId?: string;
    title: string;
    subject: string;
    grade: number;
    level: number;
    contentBlocks: any[];
    audioUrl?: string;
    estimatedMinutes?: number;
    translations?: any;
  }) {
    const id = generateUuidV7();
    return this.lessons.upsert({
      id,
      schoolId: data.schoolId || 'global',
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      level: data.level,
      contentBlocks: data.contentBlocks,
      audioUrl: data.audioUrl,
      status: 'PUBLISHED',
      estimatedMinutes: data.estimatedMinutes || 15,
      translations: data.translations,
      version: 1,
      deviceId: 'cloud',
    });
  }

  async updateLesson(id: string, data: any) {
    const existing = await this.lessons.findById(id);
    if (!existing) {
      throw new ProblemError(StandardProblems.notFound('Lesson', id));
    }

    return this.lessons.upsert({
      ...existing,
      ...data,
      id,
      version: existing.version + 1,
    });
  }

  /**
   * Publishes a versioned Content Pack with SHA-256 manifest.
   * Devices download this manifest to determine delta downloads.
   */
  async publishContentPack() {
    const lessons = await this.lessons.findMany({ status: 'PUBLISHED' });
    const quizzes = await this.quizzes.findMany();
    const schemes = await this.schemes.findMany();

    const manifestItems: any[] = [];
    let totalSize = 0;

    for (const l of lessons) {
      const serialized = JSON.stringify(l);
      const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');
      const sizeBytes = Buffer.byteLength(serialized, 'utf8');
      totalSize += sizeBytes;

      manifestItems.push({
        id: l.id,
        type: 'LESSON',
        path: `/api/v1/lessons/${l.id}`,
        sha256,
        sizeBytes,
        version: l.version,
      });
    }

    for (const q of quizzes) {
      const serialized = JSON.stringify(q);
      const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');
      const sizeBytes = Buffer.byteLength(serialized, 'utf8');
      totalSize += sizeBytes;

      manifestItems.push({
        id: q.id,
        type: 'QUIZ',
        path: `/api/v1/quizzes/${q.id}`,
        sha256,
        sizeBytes,
        version: q.version,
      });
    }

    for (const s of schemes) {
      const serialized = JSON.stringify(s);
      const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');
      const sizeBytes = Buffer.byteLength(serialized, 'utf8');
      totalSize += sizeBytes;

      manifestItems.push({
        id: s.id,
        type: 'SCHEME',
        path: `/api/v1/schemes/${s.id}`,
        sha256,
        sizeBytes,
        version: s.version,
      });
    }

    // Get current pack version count
    const count = await prisma.contentPack.count();
    const newVersion = count + 1;

    const pack = await prisma.contentPack.create({
      data: {
        id: generateUuidV7(),
        version: newVersion,
        totalSize,
        manifest: manifestItems,
        generatedAt: new Date(),
      },
    });

    return pack;
  }

  async getLatestContentPack() {
    const pack = await prisma.contentPack.findFirst({
      orderBy: { version: 'desc' },
    });

    if (!pack) {
      // Auto-publish initial content pack if none exists
      return this.publishContentPack();
    }

    return pack;
  }
}

export const contentService = new ContentService();
