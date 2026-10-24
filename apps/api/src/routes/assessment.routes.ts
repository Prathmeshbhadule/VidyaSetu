import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

export const assessmentRouter = Router();

assessmentRouter.get('/quizzes/:id', optionalAuthenticate, assessmentController.getQuizById);
assessmentRouter.post('/quizzes/submit', optionalAuthenticate, assessmentController.submitResult);
assessmentRouter.post('/adaptive/step', optionalAuthenticate, assessmentController.evaluateAdaptive);
