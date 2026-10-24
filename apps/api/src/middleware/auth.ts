import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole, StandardProblems, ProblemError } from '@vidya-setu/shared';
import { env } from '../config/env.js';

export interface AuthContext {
  id: string;
  role: UserRole;
  schoolId?: string | null;
  districtId?: string | null;
  deviceId?: string;
  isDevice?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  const deviceToken = req.header('X-Device-Token');

  // 1. Device Token Authentication (for paired tablets and school hubs)
  if (deviceToken) {
    const deviceId = req.header('X-Device-Id') || 'device-paired';
    const schoolId = req.header('X-School-Id') || 'school-default';

    // Verify HMAC signature if present
    const signature = req.header('X-Device-Signature');
    if (signature && req.body) {
      const computedSig = crypto
        .createHmac('sha256', env.DEVICE_HMAC_SECRET)
        .update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        .digest('hex');

      if (computedSig !== signature) {
        throw new ProblemError(
          StandardProblems.unauthorized('Invalid device HMAC signature. Data integrity check failed.')
        );
      }
    }

    req.user = {
      id: deviceId,
      role: 'TEACHER', // Device acts on behalf of teacher/student classroom context
      schoolId,
      deviceId,
      isDevice: true,
    };
    return next();
  }

  // 2. JWT Access Token Authentication
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ProblemError(StandardProblems.unauthorized('Missing or malformed Authorization header'));
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: UserRole;
      schoolId?: string | null;
      districtId?: string | null;
    };

    req.user = {
      id: payload.sub,
      role: payload.role,
      schoolId: payload.schoolId,
      districtId: payload.districtId,
    };

    next();
  } catch (error) {
    throw new ProblemError(StandardProblems.unauthorized('Expired or invalid access token'));
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  const deviceToken = req.header('X-Device-Token');

  if (!authHeader && !deviceToken) {
    return next();
  }

  try {
    authenticate(req, res, next);
  } catch {
    next();
  }
}
