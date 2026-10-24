import { Request, Response, NextFunction } from 'express';
import { generateUuidV7 } from '@vidya-setu/shared';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('X-Request-ID');
  const id = incoming && incoming.length > 0 ? incoming : generateUuidV7();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
}
