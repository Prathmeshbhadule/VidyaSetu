import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  evaluateAdaptiveAssessment,
  calculateStepEstimate,
  calculateNextQuestionLevel,
  INITIAL_ADAPTIVE_LEVEL,
  MAX_ADAPTIVE_QUESTIONS,
  AdaptiveStep,
} from './adaptive.js';

describe('Adaptive Assessment Engine (TaRL)', () => {
  it('starts at Level 3 on empty history', () => {
    const evalResult = evaluateAdaptiveAssessment([]);
    expect(evalResult.isComplete).toBe(false);
    expect(evalResult.currentLevel).toBe(INITIAL_ADAPTIVE_LEVEL);
    expect(evalResult.nextLevel).toBe(INITIAL_ADAPTIVE_LEVEL);
    expect(evalResult.historyLength).toBe(0);
  });

  it('moves up on correct answer and down on incorrect answer', () => {
    expect(calculateNextQuestionLevel(3, true)).toBe(4);
    expect(calculateNextQuestionLevel(3, false)).toBe(2);
    expect(calculateNextQuestionLevel(5, true)).toBe(5); // Upper bound
    expect(calculateNextQuestionLevel(1, false)).toBe(1); // Lower bound
  });

  it('stops early when two consecutive ability estimates agree', () => {
    // Step 1: Question at Level 3 answered correctly -> estimate is 3
    // Step 2: Question at Level 4 answered incorrectly -> estimate is max(1, 4 - 1) = 3
    // Estimates: [3, 3] -> agreement at Level 3!
    const history: AdaptiveStep[] = [
      { questionId: 'q1', level: 3, isCorrect: true },
      { questionId: 'q2', level: 4, isCorrect: false },
    ];

    const result = evaluateAdaptiveAssessment(history);
    expect(result.isComplete).toBe(true);
    expect(result.stopReason).toBe('CONVERGENCE');
    expect(result.assessedLevel).toBe(3);
  });

  it('stops early when student is consistently at Level 5', () => {
    // Step 1: L3 correct (est 3)
    // Step 2: L4 correct (est 4)
    // Step 3: L5 correct (est 5)
    // Step 4: L5 correct (est 5) -> Agreement at 5!
    const history: AdaptiveStep[] = [
      { questionId: 'q1', level: 3, isCorrect: true },
      { questionId: 'q2', level: 4, isCorrect: true },
      { questionId: 'q3', level: 5, isCorrect: true },
      { questionId: 'q4', level: 5, isCorrect: true },
    ];

    const result = evaluateAdaptiveAssessment(history);
    expect(result.isComplete).toBe(true);
    expect(result.assessedLevel).toBe(5);
    expect(result.stopReason).toBe('CONVERGENCE');
  });

  it('terminates after at most 8 questions even without early convergence', () => {
    // Alternating answers at boundaries that prevent early convergence
    const history: AdaptiveStep[] = [
      { questionId: 'q1', level: 3, isCorrect: true },  // est 3
      { questionId: 'q2', level: 4, isCorrect: true },  // est 4
      { questionId: 'q3', level: 5, isCorrect: false }, // est 4 -> wait, [4, 4] would converge!
    ];
    // To construct a non-converging path:
    // e.g. est sequence where adjacent elements are never equal:
    // 3, 4, 3, 4, 3, 4, 3, 4
    const alternatingHistory: AdaptiveStep[] = [
      { questionId: 'q1', level: 3, isCorrect: true },  // est 3
      { questionId: 'q2', level: 4, isCorrect: true },  // est 4
      { questionId: 'q3', level: 4, isCorrect: false }, // est 3
      { questionId: 'q4', level: 4, isCorrect: true },  // est 4
      { questionId: 'q5', level: 4, isCorrect: false }, // est 3
      { questionId: 'q6', level: 4, isCorrect: true },  // est 4
      { questionId: 'q7', level: 4, isCorrect: false }, // est 3
      { questionId: 'q8', level: 4, isCorrect: true },  // est 4 (limit 8 reached!)
    ];

    const result = evaluateAdaptiveAssessment(alternatingHistory);
    expect(result.isComplete).toBe(true);
    expect(result.stopReason).toBe('MAX_QUESTIONS');
    expect(result.assessedLevel).toBeGreaterThanOrEqual(1);
    expect(result.assessedLevel).toBeLessThanOrEqual(5);
  });

  it('property test: any sequence of boolean responses yields valid level and terminates in <= 8 steps', () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }), (booleanResponses) => {
        const history: AdaptiveStep[] = [];
        let currentLevel = INITIAL_ADAPTIVE_LEVEL;

        for (let i = 0; i < booleanResponses.length; i++) {
          const isCorrect = booleanResponses[i];
          history.push({
            questionId: `q-${i}`,
            level: currentLevel,
            isCorrect,
          });

          const assessment = evaluateAdaptiveAssessment(history);

          if (assessment.isComplete) {
            expect(assessment.assessedLevel).toBeGreaterThanOrEqual(1);
            expect(assessment.assessedLevel).toBeLessThanOrEqual(5);
            expect(history.length).toBeLessThanOrEqual(MAX_ADAPTIVE_QUESTIONS);
            break;
          } else {
            expect(assessment.nextLevel).toBeGreaterThanOrEqual(1);
            expect(assessment.nextLevel).toBeLessThanOrEqual(5);
            currentLevel = assessment.nextLevel!;
          }
        }
      })
    );
  });
});
