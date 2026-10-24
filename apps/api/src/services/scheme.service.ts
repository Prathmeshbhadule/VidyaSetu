import { schemeRepository, SchemeRepository } from '../repositories/scheme.repository.js';
import { studentRepository, StudentRepository } from '../repositories/student.repository.js';
import { attendanceRepository, AttendanceRepository } from '../repositories/attendance.repository.js';
import {
  evaluateSchemeEligibility,
  computeChecklistProgress,
  calculateAttendanceMetrics,
  generateUuidV7,
  StandardProblems,
  ProblemError,
} from '@vidya-setu/shared';

export class SchemeService {
  constructor(
    private schemes: SchemeRepository = schemeRepository,
    private students: StudentRepository = studentRepository,
    private attendance: AttendanceRepository = attendanceRepository
  ) {}

  async listSchemes(girlSpecific?: boolean) {
    return this.schemes.findMany(girlSpecific);
  }

  async getSchemeById(id: string) {
    const scheme = await this.schemes.findById(id);
    if (!scheme) {
      throw new ProblemError(StandardProblems.notFound('Scheme', id));
    }
    return scheme;
  }

  async checkEligibility(schemeId: string, studentId: string) {
    const scheme = await this.getSchemeById(schemeId);
    const student = await this.students.findById(studentId);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', studentId));
    }

    const attendanceRecords = await this.attendance.findMany({ studentId });
    const attendanceMetrics = calculateAttendanceMetrics(attendanceRecords as any);

    const eligibility = evaluateSchemeEligibility(
      scheme as any,
      student as any,
      attendanceMetrics.attendancePercent
    );

    return {
      schemeId,
      studentId,
      schemeName: scheme.name,
      ...eligibility,
      attendancePercent: attendanceMetrics.attendancePercent,
    };
  }

  async getStudentChecklist(studentId: string, schemeId: string) {
    const scheme = await this.getSchemeById(schemeId);
    const progress = await this.schemes.findChecklistProgress(studentId, schemeId);

    const checkedDocs = (progress?.checkedDocs as string[]) || [];
    const summary = computeChecklistProgress(scheme.requiredDocuments as string[], checkedDocs);

    return {
      studentId,
      schemeId,
      schemeName: scheme.name,
      requiredDocuments: scheme.requiredDocuments,
      checkedDocs,
      summary,
      disclaimer: 'SAMPLE DATA - verify rules and benefits with the official issuing authority.',
      lastVerifiedAt: scheme.lastVerifiedAt,
    };
  }

  async updateChecklistProgress(data: {
    studentId: string;
    schemeId: string;
    checkedDocs: string[];
    deviceId?: string;
    hlc?: string;
  }) {
    const scheme = await this.getSchemeById(data.schemeId);
    const student = await this.students.findById(data.studentId);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', data.studentId));
    }

    const summary = computeChecklistProgress(scheme.requiredDocuments as string[], data.checkedDocs);
    const id = generateUuidV7();

    const progress = await this.schemes.upsertChecklistProgress({
      id,
      schoolId: student.schoolId,
      studentId: data.studentId,
      schemeId: data.schemeId,
      checkedDocs: data.checkedDocs,
      completed: summary.isComplete,
      deviceId: data.deviceId || 'cloud',
      hlc: data.hlc,
      version: 1,
    });

    return {
      progress,
      summary,
    };
  }

  async listFacilities(districtId?: string) {
    return this.schemes.findFacilities(districtId);
  }
}

export const schemeService = new SchemeService();
