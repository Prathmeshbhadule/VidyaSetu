import { describe, it, expect } from 'vitest';
import { createProblem, ProblemError, StandardProblems } from './problem.js';

describe('RFC 7807 Problem Details and Errors', () => {
  it('instantiates ProblemError correctly with message', () => {
    const problem = createProblem(400, 'Bad Request', 'Invalid input');
    const err = new ProblemError(problem);

    expect(err.name).toBe('ProblemError');
    expect(err.message).toBe('Invalid input');
    expect(err.problem.status).toBe(400);
  });

  it('generates all standard problem types accurately', () => {
    const unauth = StandardProblems.unauthorized();
    expect(unauth.status).toBe(401);

    const forbidden = StandardProblems.forbidden();
    expect(forbidden.status).toBe(403);

    const conflict = StandardProblems.conflict('Email exists');
    expect(conflict.status).toBe(409);

    const internal = StandardProblems.internal();
    expect(internal.status).toBe(500);

    const notFound = StandardProblems.notFound('User', 'u-1');
    expect(notFound.status).toBe(404);
  });
});
