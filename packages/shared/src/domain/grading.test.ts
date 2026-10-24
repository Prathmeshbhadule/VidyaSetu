import { describe, it, expect } from 'vitest';
import { gradeQuiz } from './grading.js';
import { Quiz } from '../types/index.js';

describe('Quiz Grading Logic', () => {
  const sampleQuiz: Quiz = {
    id: 'quiz-01',
    schoolId: 'school-01',
    lessonId: 'lesson-01',
    title: 'Basic Addition',
    subject: 'MATH',
    grade: 2,
    totalMarks: 10,
    passingMarks: 6,
    version: 1,
    deviceId: 'device-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    questions: [
      {
        id: 'q1',
        type: 'MCQ',
        prompt: '2 + 3 = ?',
        options: [
          { id: 'opt1', text: '4' },
          { id: 'opt2', text: '5' },
          { id: 'opt3', text: '6' },
        ],
        correctOptionId: 'opt2',
        level: 2,
        marks: 5,
      },
      {
        id: 'q2',
        type: 'TRUE_FALSE',
        prompt: '5 is greater than 8',
        options: [
          { id: 'true_opt', text: 'True' },
          { id: 'false_opt', text: 'False' },
        ],
        correctOptionId: 'false_opt',
        level: 2,
        marks: 5,
      },
    ],
  };

  it('grades a perfect score with 3 stars', () => {
    const result = gradeQuiz(sampleQuiz, [
      { questionId: 'q1', selectedOptionId: 'opt2' },
      { questionId: 'q2', selectedOptionId: 'false_opt' },
    ]);

    expect(result.score).toBe(10);
    expect(result.percentage).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.starRating).toBe(3);
    expect(result.correctCount).toBe(2);
  });

  it('grades a partial score with 2 stars', () => {
    const result = gradeQuiz(sampleQuiz, [
      { questionId: 'q1', selectedOptionId: 'opt2' },
      { questionId: 'q2', selectedOptionId: 'true_opt' }, // wrong
    ]);

    expect(result.score).toBe(5);
    expect(result.percentage).toBe(50);
    expect(result.isPassed).toBe(false); // passing is 6
    expect(result.starRating).toBe(2);
    expect(result.correctCount).toBe(1);
  });

  it('grades a zero score with 0 stars', () => {
    const result = gradeQuiz(sampleQuiz, [
      { questionId: 'q1', selectedOptionId: 'opt1' },
      { questionId: 'q2', selectedOptionId: 'true_opt' },
    ]);

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.isPassed).toBe(false);
    expect(result.starRating).toBe(0);
    expect(result.correctCount).toBe(0);
  });
});
