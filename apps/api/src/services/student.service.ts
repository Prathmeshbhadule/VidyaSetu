import { studentRepository, StudentRepository, StudentFilter } from '../repositories/student.repository.js';
import { attendanceRepository, AttendanceRepository } from '../repositories/attendance.repository.js';
import { quizResultRepository, QuizResultRepository } from '../repositories/quiz-result.repository.js';
import { schemeRepository, SchemeRepository } from '../repositories/scheme.repository.js';
import { atRiskRepository, AtRiskRepository } from '../repositories/at-risk.repository.js';
import { calculateAttendanceMetrics, generateUuidV7, StandardProblems, ProblemError } from '@vidya-setu/shared';
import argon2 from 'argon2';

export class StudentService {
  constructor(
    private students: StudentRepository = studentRepository,
    private attendance: AttendanceRepository = attendanceRepository,
    private quizResults: QuizResultRepository = quizResultRepository,
    private schemes: SchemeRepository = schemeRepository,
    private atRisk: AtRiskRepository = atRiskRepository
  ) {}

  async listStudents(filter: StudentFilter) {
    return this.students.findMany(filter);
  }

  async getStudentById(id: string) {
    const student = await this.students.findById(id);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', id));
    }

    const attendanceRecords = await this.attendance.findMany({ studentId: id });
    const attendanceStats = calculateAttendanceMetrics(attendanceRecords as any);
    const activeAtRiskFlags = await this.atRisk.findMany({ studentId: id, resolved: false });

    return {
      ...student,
      attendanceStats,
      activeAtRiskFlags,
    };
  }

  async createStudent(data: {
    schoolId: string;
    name: string;
    prn: string;
    grade: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    avatarId?: string;
    pin: string;
    parentalConsent?: boolean;
    deviceId?: string;
  }) {
    const existing = await this.students.findByPrn(data.prn);
    if (existing) {
      throw new ProblemError(StandardProblems.conflict(`Student with PRN "${data.prn}" already exists`));
    }

    const pinHash = await argon2.hash(data.pin, { type: argon2.argon2id });
    const id = generateUuidV7();

    return this.students.upsert({
      id,
      schoolId: data.schoolId,
      name: data.name,
      prn: data.prn,
      grade: data.grade,
      gender: data.gender,
      assessedLevel: 1,
      avatarId: data.avatarId || 'avatar-1',
      pinHash,
      parentalConsent: data.parentalConsent ?? true,
      deviceId: data.deviceId || 'cloud',
      version: 1,
    });
  }

  async updateStudent(id: string, data: Partial<{
    name: string;
    grade: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    assessedLevel: number;
    avatarId: string;
    pin: string;
    parentalConsent: boolean;
  }>) {
    const existing = await this.students.findById(id);
    if (!existing) {
      throw new ProblemError(StandardProblems.notFound('Student', id));
    }

    const updatePayload: any = { ...data };
    if (data.pin) {
      updatePayload.pinHash = await argon2.hash(data.pin, { type: argon2.argon2id });
      delete updatePayload.pin;
    }

    return this.students.update(id, updatePayload);
  }

  /**
   * DPDP Act 2023: Right to Data Portability.
   * Generates a complete, verifiable JSON export of a student's educational data.
   */
  async exportStudentData(id: string) {
    const student = await this.students.findById(id);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', id));
    }

    const attendanceHistory = await this.attendance.findMany({ studentId: id });
    const quizResults = await this.quizResults.findMany({ studentId: id });
    const schemeChecklists = await this.schemes.findStudentChecklists(id);
    const atRiskHistory = await this.atRisk.findMany({ studentId: id });

    return {
      exportedAt: new Date().toISOString(),
      dpdpActNotice: 'Official export of student educational record under DPDP Act 2023. No biometric or Aadhaar data is retained.',
      profile: {
        id: student.id,
        name: student.name,
        prn: student.prn,
        grade: student.grade,
        gender: student.gender,
        assessedLevel: student.assessedLevel,
        parentalConsent: student.parentalConsent,
        schoolId: student.schoolId,
        createdAt: student.createdAt,
      },
      attendance: attendanceHistory,
      assessments: quizResults,
      schemes: schemeChecklists,
      supportInterventions: atRiskHistory,
    };
  }

  /**
   * DPDP Act 2023: Right to Erasure.
   */
  async deleteStudent(id: string) {
    const student = await this.students.findById(id);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', id));
    }

    return this.students.softDelete(id);
  }
}

export const studentService = new StudentService();
