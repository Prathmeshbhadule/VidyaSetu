import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createProblem, ProblemError, ProblemDetails } from '@vidya-setu/shared';
import { logger } from '../config/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  res.setHeader('Content-Type', 'application/problem+json');

  if (err instanceof ProblemError) {
    const problem = { ...err.problem, instance: req.originalUrl };
    res.status(problem.status).json(problem);
    return;
  }

  if (err instanceof ZodError || (err as any)?.name === 'ZodError') {
    const invalidParams = (err as ZodError).issues.map((issue) => ({
      name: issue.path.join('.'),
      reason: issue.message,
    }));

    const problem: ProblemDetails = createProblem(
      400,
      'Validation Failed',
      'One or more input parameters failed validation checks',
      'https://vidyasetu.org/errors/validation-failed',
      req.originalUrl,
      invalidParams
    );

    res.status(400).json(problem);
    return;
  }

  // General unhandled exceptions
  const message = err instanceof Error ? err.message : 'Unknown server error';
  logger.error({ err, requestId: req.id, url: req.originalUrl }, 'Unhandled internal server error');

  const internalProblem: ProblemDetails = createProblem(
    500,
    'Internal Server Error',
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    'https://vidyasetu.org/errors/internal-server-error',
    req.originalUrl
  );

  res.status(500).json(internalProblem);
}
