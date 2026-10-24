import { Quiz, QuizAnswer } from '../types/index.js';

export interface GradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  starRating: number; // 0 to 3 stars
  answers: QuizAnswer[];
  totalQuestions: number;
  correctCount: number;
}

export function gradeQuiz(
  quiz: Quiz,
  submissions: Array<{ questionId: string; selectedOptionId: string; timeSpentSec?: number }>
): GradingResult {
  let score = 0;
  let correctCount = 0;
  const gradedAnswers: QuizAnswer[] = [];

  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));

  for (const submission of submissions) {
    const question = questionMap.get(submission.questionId);
    if (!question) continue;

    const isCorrect = submission.selectedOptionId === question.correctOptionId;
    const marksAwarded = isCorrect ? question.marks : 0;

    score += marksAwarded;
    if (isCorrect) {
      correctCount++;
    }

    gradedAnswers.push({
      questionId: question.id,
      selectedOptionId: submission.selectedOptionId,
      isCorrect,
      marksAwarded,
      timeSpentSec: submission.timeSpentSec ?? 0,
    });
  }

  const maxScore = quiz.totalMarks > 0 ? quiz.totalMarks : Math.max(1, quiz.questions.reduce((sum, q) => sum + q.marks, 0));
  const percentage = Math.round((score / maxScore) * 100);
  const isPassed = score >= quiz.passingMarks;

  let starRating = 0;
  if (percentage >= 80) {
    starRating = 3;
  } else if (percentage >= 50) {
    starRating = 2;
  } else if (percentage > 0) {
    starRating = 1;
  }

  return {
    score,
    maxScore,
    percentage,
    isPassed,
    starRating,
    answers: gradedAnswers,
    totalQuestions: quiz.questions.length,
    correctCount,
  };
}
