import { Request, Response, NextFunction } from 'express';
import { UserRole, StandardProblems, ProblemError } from '@vidya-setu/shared';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ProblemError(StandardProblems.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ProblemError(
        StandardProblems.forbidden(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

export function enforceSchoolTenant(schoolIdExtractor?: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ProblemError(StandardProblems.unauthorized());
    }

    // Global admins bypass school-level restrictions
    if (req.user.role === 'CONTENT_ADMIN' || req.user.role === 'DISTRICT_ADMIN') {
      return next();
    }

    const targetSchoolId = schoolIdExtractor
      ? schoolIdExtractor(req)
      : (req.params.schoolId || (req.query.schoolId as string) || req.body?.schoolId);

    if (targetSchoolId && req.user.schoolId && req.user.schoolId !== targetSchoolId) {
      throw new ProblemError(
        StandardProblems.forbidden(
          `Tenant violation: Access denied to school ${targetSchoolId}. Your account is scoped to school ${req.user.schoolId}`
        )
      );
    }

    next();
  };
}
