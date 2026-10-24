import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { deviceRepository, DeviceRepository } from '../repositories/device.repository.js';
import { studentRepository, StudentRepository } from '../repositories/student.repository.js';
import { env } from '../config/env.js';
import { StandardProblems, ProblemError, UserRole, generateUuidV7 } from '@vidya-setu/shared';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 900 seconds (15 minutes)
  user: {
    id: string;
    username: string;
    role: UserRole;
    schoolId?: string | null;
    districtId?: string | null;
    name?: string;
  };
}

export class AuthService {
  constructor(
    private users: UserRepository = userRepository,
    private devices: DeviceRepository = deviceRepository,
    private students: StudentRepository = studentRepository
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  generateTokens(user: { id: string; role: UserRole; schoolId?: string | null; districtId?: string | null }): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessPayload = {
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId,
      districtId: user.districtId,
    };

    const accessToken = jwt.sign(accessPayload, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(identifier: string, passwordPlain: string): Promise<TokenPair> {
    const user = identifier.includes('@')
      ? await this.users.findByEmail(identifier)
      : await this.users.findByUsername(identifier);

    if (!user || !user.passwordHash) {
      throw new ProblemError(StandardProblems.unauthorized('Invalid email/username or password'));
    }

    const isValid = await this.verifyPassword(user.passwordHash, passwordPlain);
    if (!isValid) {
      throw new ProblemError(StandardProblems.unauthorized('Invalid email/username or password'));
    }

    const districtId = user.admin?.districtId;
    const { accessToken, refreshToken } = this.generateTokens({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      districtId,
    });

    const displayName = user.teacher?.name || user.guardian?.name || user.username;

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        districtId,
        name: displayName,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
      const user = await this.users.findById(decoded.sub);

      if (!user) {
        throw new ProblemError(StandardProblems.unauthorized('User not found'));
      }

      const tokens = this.generateTokens({
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
        districtId: user.admin?.districtId,
      });

      return {
        ...tokens,
        expiresIn: 900,
      };
    } catch {
      throw new ProblemError(StandardProblems.unauthorized('Invalid or expired refresh token'));
    }
  }

  async verifyStudentPin(studentId: string, pin: string): Promise<{ valid: boolean; student?: any }> {
    const student = await this.students.findById(studentId);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', studentId));
    }

    let isValid = false;
    if (student.pinHash.startsWith('$argon2')) {
      isValid = await argon2.verify(student.pinHash, pin);
    } else {
      // Direct comparison for development/plain seeds
      isValid = student.pinHash === pin;
    }

    return { valid: isValid, student: isValid ? student : undefined };
  }

  async pairDevice(schoolId: string, deviceName: string, deviceType: 'TABLET' | 'HUB_PC' | 'PHONE'): Promise<{
    deviceId: string;
    deviceToken: string;
    schoolId: string;
  }> {
    const deviceId = generateUuidV7();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.devices.upsert({
      id: deviceId,
      schoolId,
      name: deviceName,
      type: deviceType,
      tokenHash,
      pairedAt: new Date(),
      lastSeenAt: new Date(),
    });

    return {
      deviceId,
      deviceToken: rawToken,
      schoolId,
    };
  }
}

export const authService = new AuthService();
