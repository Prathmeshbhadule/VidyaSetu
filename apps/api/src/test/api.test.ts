import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app.js';
import { env } from '../config/env.js';

describe('Vidya Setu API Integration & Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Probes & Standard Endpoints', () => {
    it('GET /healthz returns 200 with service status', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('vidya-setu-api');
    });

    it('GET /api/v1/non-existent returns RFC 7807 Problem Details 404', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint');
      expect(res.status).toBe(404);
      expect(res.header['content-type']).toContain('application/problem+json');
      expect(res.body.title).toBe('Not Found');
      expect(res.body.status).toBe(404);
    });
  });

  describe('Authentication & Token Verification', () => {
    it('rejects protected endpoints with 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/students');
      expect(res.status).toBe(401);
      expect(res.header['content-type']).toContain('application/problem+json');
      expect(res.body.title).toBe('Unauthorized');
    });

    it('rejects tampered or malformed JWT token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', 'Bearer invalid-token-string');
      expect(res.status).toBe(401);
      expect(res.body.title).toBe('Unauthorized');
    });

    it('accepts paired device token header', async () => {
      const res = await request(app)
        .get('/api/v1/students?schoolId=school-01')
        .set('X-Device-Token', 'test-device-token')
        .set('X-Device-Id', 'dev-tablet-01')
        .set('X-School-Id', 'school-01');

      // Passes auth middleware (status will be 200 or db response, but not 401)
      expect(res.status).not.toBe(401);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('forbids STUDENT role from accessing teacher-only student creation endpoint', async () => {
      const studentToken = jwt.sign(
        { sub: 'stu-1', role: 'STUDENT', schoolId: 'school-01' },
        env.JWT_SECRET
      );

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          schoolId: 'school-01',
          name: 'Hacked Student',
          prn: 'HACK001',
          grade: 5,
          gender: 'MALE',
          pin: '1234',
        });

      expect(res.status).toBe(403);
      expect(res.body.title).toBe('Forbidden');
      expect(res.body.detail).toContain('Action requires one of the following roles');
    });

    it('forbids TEACHER role from accessing district dashboard', async () => {
      const teacherToken = jwt.sign(
        { sub: 'teacher-1', role: 'TEACHER', schoolId: 'school-01' },
        env.JWT_SECRET
      );

      const res = await request(app)
        .get('/api/v1/district/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.title).toBe('Forbidden');
    });
  });

  describe('Tenant Isolation Tests', () => {
    it('blocks teacher from school A from writing attendance for school B', async () => {
      const teacherTokenSchoolA = jwt.sign(
        { sub: 'teacher-a', role: 'TEACHER', schoolId: 'school-a-id' },
        env.JWT_SECRET
      );

      const res = await request(app)
        .post('/api/v1/attendance/mark')
        .set('Authorization', `Bearer ${teacherTokenSchoolA}`)
        .send({
          schoolId: 'school-b-id', // Cross-tenant target
          studentId: 'stu-b-1',
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT',
          markedBy: 'teacher-a',
        });

      expect(res.status).toBe(403);
      expect(res.body.title).toBe('Forbidden');
      expect(res.body.detail).toContain('Tenant violation');
    });
  });

  describe('Attendance Domain Rules (7-day Edit Window)', () => {
    it('rejects attendance marked for dates older than 7 days with 400 Bad Request', async () => {
      const teacherToken = jwt.sign(
        { sub: 'teacher-1', role: 'TEACHER', schoolId: 'school-01' },
        env.JWT_SECRET
      );

      const ancientDate = '2020-01-01'; // Far beyond 7 days
      const res = await request(app)
        .post('/api/v1/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          schoolId: 'school-01',
          studentId: 'stu-1',
          date: ancientDate,
          status: 'PRESENT',
          markedBy: 'teacher-1',
        });

      expect(res.status).toBe(400);
      expect(res.body.title).toBe('Bad Request');
      expect(res.body.detail).toContain('outside the allowed 7-day modification window');
    });
  });

  describe('Sync Protocol Validation', () => {
    it('rejects sync push batch exceeding 200 mutations with 400 Bad Request', async () => {
      const token = jwt.sign(
        { sub: 'device-1', role: 'TEACHER', schoolId: 'school-01' },
        env.JWT_SECRET
      );

      const oversizeBatch = Array.from({ length: 201 }, (_, i) => ({
        id: `018f679a-1111-7000-8000-${i.toString().padStart(12, '0')}`,
        entity: 'Attendance',
        entityId: `018f679a-2222-7000-8000-${i.toString().padStart(12, '0')}`,
        op: 'INSERT',
        schoolId: 'school-01',
        deviceId: 'dev-01',
        payload: {},
        hlc: '1000:0:dev-01',
      }));

      const res = await request(app)
        .post('/api/v1/sync/push')
        .set('Authorization', `Bearer ${token}`)
        .send({
          schemaVersion: 1,
          deviceId: 'dev-01',
          schoolId: 'school-01',
          batchId: 'batch-oversize',
          changes: oversizeBatch,
        });

      expect(res.status).toBe(400);
      expect(res.body.title).toBe('Validation Failed');
      expect(res.body.invalidParams.some((p: any) => p.name === 'changes')).toBe(true);
    });
  });
});
