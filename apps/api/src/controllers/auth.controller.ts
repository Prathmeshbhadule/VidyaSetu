import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService, AuthService } from '../services/auth.service.js';

const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const VerifyPinSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});

const PairDeviceSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  deviceType: z.enum(['TABLET', 'HUB_PC', 'PHONE']).default('TABLET'),
});

export class AuthController {
  constructor(private auth: AuthService = authService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier, password } = LoginSchema.parse(req.body);
      const tokenPair = await this.auth.login(identifier, password);

      // Set refresh token in httpOnly secure cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json(tokenPair);
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        res.status(401).json({ status: 401, title: 'Unauthorized', detail: 'Refresh token missing' });
        return;
      }

      const refreshed = await this.auth.refresh(token);

      res.cookie('refreshToken', refreshed.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(refreshed);
    } catch (err) {
      next(err);
    }
  };

  verifyPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, pin } = VerifyPinSchema.parse(req.body);
      const result = await this.auth.verifyStudentPin(studentId, pin);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  pairDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId, deviceName, deviceType } = PairDeviceSchema.parse(req.body);
      const pairResult = await this.auth.pairDevice(schoolId, deviceName, deviceType);
      res.status(201).json(pairResult);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  };
}

export const authController = new AuthController();
