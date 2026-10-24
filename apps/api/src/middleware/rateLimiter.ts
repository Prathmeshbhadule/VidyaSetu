import rateLimit from 'express-rate-limit';
import { StandardProblems, ProblemError } from '@vidya-setu/shared';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ProblemError(
      StandardProblems.badRequest('Too many requests, please slow down and try again later.')
    );
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit login/auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ProblemError(
      StandardProblems.badRequest('Too many authentication attempts. Please wait 5 minutes.')
    );
  },
});
