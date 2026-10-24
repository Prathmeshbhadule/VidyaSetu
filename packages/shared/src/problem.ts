import { ProblemDetails } from './types/index.js';

export class ProblemError extends Error {
  public readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = 'ProblemError';
    this.problem = problem;
  }
}

export function createProblem(
  status: number,
  title: string,
  detail: string,
  type: string = 'about:blank',
  instance?: string,
  invalidParams?: Array<{ name: string; reason: string }>,
  extra?: Record<string, unknown>
): ProblemDetails {
  return {
    type,
    title,
    status,
    detail,
    ...(instance ? { instance } : {}),
    ...(invalidParams && invalidParams.length > 0 ? { invalidParams } : {}),
    ...(extra || {}),
  };
}

export const StandardProblems = {
  badRequest: (detail: string, invalidParams?: Array<{ name: string; reason: string }>, instance?: string) =>
    createProblem(400, 'Bad Request', detail, 'https://vidyasetu.org/errors/bad-request', instance, invalidParams),

  unauthorized: (detail: string = 'Authentication required', instance?: string) =>
    createProblem(401, 'Unauthorized', detail, 'https://vidyasetu.org/errors/unauthorized', instance),

  forbidden: (detail: string = 'Access denied for your role or tenant', instance?: string) =>
    createProblem(403, 'Forbidden', detail, 'https://vidyasetu.org/errors/forbidden', instance),

  notFound: (resource: string, id: string, instance?: string) =>
    createProblem(404, 'Not Found', `${resource} with ID "${id}" was not found`, 'https://vidyasetu.org/errors/not-found', instance),

  conflict: (detail: string, instance?: string) =>
    createProblem(409, 'Conflict', detail, 'https://vidyasetu.org/errors/conflict', instance),

  internal: (detail: string = 'An unexpected internal error occurred', instance?: string) =>
    createProblem(500, 'Internal Server Error', detail, 'https://vidyasetu.org/errors/internal-server-error', instance),
};
