import { quizRepository, QuizRepository } from '../repositories/quiz.repository.js';
import { quizResultRepository, QuizResultRepository } from '../repositories/quiz-result.repository.js';
import { studentRepository, StudentRepository } from '../repositories/student.repository.js';
import {
  gradeQuiz,
  evaluateAdaptiveAssessment,
  generateUuidV7,
  StandardProblems,
  ProblemError,
  AdaptiveStep,
} from '@vidya-setu/shared';

export class AssessmentService {
  constructor(
    private quizzes: QuizRepository = quizRepository,
    private results: QuizResultRepository = quizResultRepository,
    private students: StudentRepository = studentRepository
  ) {}

  async getQuizById(id: string) {
    const quiz = await this.quizzes.findById(id);
    if (!quiz) {
      throw new ProblemError(StandardProblems.notFound('Quiz', id));
    }
    return quiz;
  }

  async submitQuizResult(data: {
    studentId: string;
    quizId: string;
    answers: Array<{ questionId: string; selectedOptionId: string; timeSpentSec?: number }>;
    startedAt: string;
    submittedAt?: string;
    deviceId?: string;
    hlc?: string;
  }) {
    const quiz = await this.quizzes.findById(data.quizId);
    if (!quiz) {
      throw new ProblemError(StandardProblems.notFound('Quiz', data.quizId));
    }

    const student = await this.students.findById(data.studentId);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', data.studentId));
    }

    const grading = gradeQuiz(quiz as any, data.answers);
    const id = generateUuidV7();
    const submittedAt = data.submittedAt ? new Date(data.submittedAt) : new Date();

    const result = await this.results.create({
      id,
      schoolId: student.schoolId,
      studentId: data.studentId,
      quizId: data.quizId,
      mode: 'QUIZ',
      answers: grading.answers as any,
      score: grading.score,
      maxScore: grading.maxScore,
      assessedLevel: student.assessedLevel,
      startedAt: new Date(data.startedAt),
      submittedAt,
      deviceId: data.deviceId || 'cloud',
      hlc: data.hlc,
      version: 1,
    });

    return {
      result,
      grading,
    };
  }

  /**
   * Adaptive assessment step execution.
   */
  async evaluateAdaptiveStep(studentId: string, history: AdaptiveStep[]) {
    const student = await this.students.findById(studentId);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', studentId));
    }

    const evaluation = evaluateAdaptiveAssessment(history);

    if (evaluation.isComplete && evaluation.assessedLevel) {
      // Persist the student's newly assessed learning level
      await this.students.update(studentId, {
        assessedLevel: evaluation.assessedLevel,
      });

      return {
        ...evaluation,
        studentId,
        newAssessedLevel: evaluation.assessedLevel,
      };
    }

    // Next question selection for the targeted level
    const nextLevel = evaluation.nextLevel ?? 3;
    const candidateQuestions = await this.quizzes.findQuestionsByLevel(nextLevel, 5);

    // Filter out already answered questions
    const answeredIds = new Set(history.map((h) => h.questionId));
    const available = candidateQuestions.filter((q) => !answeredIds.has(q.id));
    const nextQuestion = available.length > 0 ? available[0] : candidateQuestions[0];

    return {
      ...evaluation,
      nextQuestion,
    };
  }
}

export const assessmentService = new AssessmentService();
