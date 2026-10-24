/**
 * Adaptive Assessment Engine (Teaching at the Right Level - TaRL).
 *
 * Implements an accelerated 5-level staircase algorithm:
 * - Levels: 1 to 5
 * - Start at Level 3
 * - If correct: advance +1 level (up to Level 5)
 * - If incorrect: drop -1 level (down to Level 1)
 * - Stopping conditions:
 *   1. Exactly 8 questions completed (max limit)
 *   2. Two consecutive ability estimates agree (convergence)
 * - Output: Assessed level (1-5) and next question level candidate.
 */

export interface AdaptiveStep {
  questionId: string;
  level: number;       // Level the question was presented at (1-5)
  isCorrect: boolean;  // Did the student answer correctly?
}

export interface AdaptiveEvaluation {
  isComplete: boolean;
  currentLevel: number;       // Level of the latest question
  nextLevel?: number;         // Level to present next (1-5), if not complete
  assessedLevel?: number;     // Final assessed level (1-5), if complete
  stopReason?: 'CONVERGENCE' | 'MAX_QUESTIONS' | 'INITIAL';
  estimates: number[];        // Ability estimate at each step
  historyLength: number;
}

export const INITIAL_ADAPTIVE_LEVEL = 3;
export const MAX_ADAPTIVE_QUESTIONS = 8;
export const MIN_ADAPTIVE_LEVEL = 1;
export const MAX_ADAPTIVE_LEVEL = 5;

/**
 * Calculates the point estimate of a student's ability level after answering an item.
 * - If answered correctly at level L, the student has demonstrated competency at L.
 * - If answered incorrectly at level L, the student's ability is below L (estimated at max(1, L - 1)).
 */
export function calculateStepEstimate(level: number, isCorrect: boolean): number {
  if (isCorrect) {
    return Math.min(MAX_ADAPTIVE_LEVEL, Math.max(MIN_ADAPTIVE_LEVEL, level));
  }
  return Math.max(MIN_ADAPTIVE_LEVEL, level - 1);
}

/**
 * Determines the next question difficulty level to present.
 */
export function calculateNextQuestionLevel(currentLevel: number, isCorrect: boolean): number {
  if (isCorrect) {
    return Math.min(MAX_ADAPTIVE_LEVEL, currentLevel + 1);
  }
  return Math.max(MIN_ADAPTIVE_LEVEL, currentLevel - 1);
}

/**
 * Evaluates the full adaptive assessment history and determines whether testing
 * should continue, which level to present next, or if converged, the final assessed level.
 */
export function evaluateAdaptiveAssessment(history: AdaptiveStep[]): AdaptiveEvaluation {
  if (history.length === 0) {
    return {
      isComplete: false,
      currentLevel: INITIAL_ADAPTIVE_LEVEL,
      nextLevel: INITIAL_ADAPTIVE_LEVEL,
      estimates: [],
      historyLength: 0,
      stopReason: 'INITIAL',
    };
  }

  const estimates: number[] = [];
  for (const step of history) {
    estimates.push(calculateStepEstimate(step.level, step.isCorrect));
  }

  const lastStep = history[history.length - 1];
  const lastEstimate = estimates[estimates.length - 1];

  // Check Stopping Condition 1: Two consecutive estimates agree
  if (history.length >= 2) {
    const prevEstimate = estimates[estimates.length - 2];
    if (lastEstimate === prevEstimate) {
      return {
        isComplete: true,
        currentLevel: lastStep.level,
        assessedLevel: lastEstimate,
        stopReason: 'CONVERGENCE',
        estimates,
        historyLength: history.length,
      };
    }
  }

  // Check Stopping Condition 2: Max questions reached (8 questions)
  if (history.length >= MAX_ADAPTIVE_QUESTIONS) {
    // If not converged by 8 questions, derive assessed level from the median of the last 3 estimates
    const tail = estimates.slice(-3);
    const sorted = [...tail].sort((a, b) => a - b);
    const assessedLevel = sorted[Math.floor(sorted.length / 2)];

    return {
      isComplete: true,
      currentLevel: lastStep.level,
      assessedLevel,
      stopReason: 'MAX_QUESTIONS',
      estimates,
      historyLength: history.length,
    };
  }

  // Otherwise, determine next question level
  const nextLevel = calculateNextQuestionLevel(lastStep.level, lastStep.isCorrect);

  return {
    isComplete: false,
    currentLevel: lastStep.level,
    nextLevel,
    estimates,
    historyLength: history.length,
  };
}
