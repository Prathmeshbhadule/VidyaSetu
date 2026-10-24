import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { assessmentService, AssessmentService } from '../services/assessment.service.js';

const SubmitQuizSchema = z.object({
  studentId: z.string().min(1),
  quizId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionId: z.string().min(1),
      timeSpentSec: z.number().default(0),
    })
  ),
  startedAt: z.string().datetime(),
  submittedAt: z.string().datetime().optional(),
});

const AdaptiveStepSchema = z.object({
  studentId: z.string().min(1),
  history: z.array(
    z.object({
      questionId: z.string(),
      level: z.number().int().min(1).max(5),
      isCorrect: z.boolean(),
    })
  ),
});

export class AssessmentController {
  constructor(private assessment: AssessmentService = assessmentService) {}

  getQuizById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quiz = await this.assessment.getQuizById(req.params.id);
      res.status(200).json(quiz);
    } catch (err) {
      next(err);
    }
  };

  submitResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = SubmitQuizSchema.parse(req.body);
      const outcome = await this.assessment.submitQuizResult(data);
      res.status(201).json(outcome);
    } catch (err) {
      next(err);
    }
  };

  evaluateAdaptive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, history } = AdaptiveStepSchema.parse(req.body);
      const stepResult = await this.assessment.evaluateAdaptiveStep(studentId, history);
      res.status(200).json(stepResult);
    } catch (err) {
      next(err);
    }
  };
}

export const assessmentController = new AssessmentController();
