import { attendanceRepository, AttendanceRepository } from '../repositories/attendance.repository.js';
import { studentRepository, StudentRepository } from '../repositories/student.repository.js';
import { atRiskRepository, AtRiskRepository } from '../repositories/at-risk.repository.js';
import { schemeRepository, SchemeRepository } from '../repositories/scheme.repository.js';
import {
  evaluateStudentAtRisk,
  createAtRiskEntities,
  generateUuidV7,
  StandardProblems,
  ProblemError,
  AttendanceStatus,
  AttendanceSource,
} from '@vidya-setu/shared';

export class AttendanceService {
  constructor(
    private attendance: AttendanceRepository = attendanceRepository,
    private students: StudentRepository = studentRepository,
    private atRisk: AtRiskRepository = atRiskRepository,
    private schemes: SchemeRepository = schemeRepository
  ) {}

  /**
   * Enforces 7-day historical editing window for attendance modifications.
   */
  private validateDateWindow(dateString: string): void {
    const recordDate = new Date(dateString);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Normalize to date-only comparisons
    recordDate.setHours(0, 0, 0, 0);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    now.setHours(23, 59, 59, 999);

    if (recordDate < sevenDaysAgo) {
      throw new ProblemError(
        StandardProblems.badRequest(
          `Attendance date ${dateString} is outside the allowed 7-day modification window.`
        )
      );
    }

    if (recordDate > now) {
      throw new ProblemError(
        StandardProblems.badRequest(`Attendance cannot be marked for future date ${dateString}.`)
      );
    }
  }

  async markAttendance(data: {
    schoolId: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    markedBy: string;
    source?: AttendanceSource;
    note?: string;
    deviceId?: string;
    hlc?: string;
  }) {
    this.validateDateWindow(data.date);

    const student = await this.students.findById(data.studentId);
    if (!student) {
      throw new ProblemError(StandardProblems.notFound('Student', data.studentId));
    }

    const id = generateUuidV7();
    const record = await this.attendance.upsert({
      id,
      schoolId: data.schoolId,
      studentId: data.studentId,
      date: data.date,
      status: data.status,
      markedBy: data.markedBy,
      source: data.source || 'TEACHER',
      note: data.note,
      deviceId: data.deviceId || 'cloud',
      hlc: data.hlc,
      version: 1,
    });

    // Automatically evaluate at-risk triggers for this student
    await this.refreshStudentAtRisk(student.id);

    return record;
  }

  async bulkMarkAttendance(
    schoolId: string,
    records: Array<{
      studentId: string;
      date: string;
      status: AttendanceStatus;
      markedBy: string;
      source?: AttendanceSource;
      note?: string;
      deviceId?: string;
      hlc?: string;
    }>
  ) {
    const updated = [];
    const studentIds = new Set<string>();

    for (const r of records) {
      this.validateDateWindow(r.date);
      const res = await this.attendance.upsert({
        id: generateUuidV7(),
        schoolId,
        studentId: r.studentId,
        date: r.date,
        status: r.status,
        markedBy: r.markedBy,
        source: r.source || 'TEACHER',
        note: r.note,
        deviceId: r.deviceId || 'cloud',
        hlc: r.hlc,
        version: 1,
      });
      updated.push(res);
      studentIds.add(r.studentId);
    }

    // Refresh at-risk flags for all affected students
    for (const sId of studentIds) {
      await this.refreshStudentAtRisk(sId);
    }

    return updated;
  }

  async getAttendanceGrid(schoolId: string, grade?: number, days: number = 7) {
    const students = await this.students.findMany({ schoolId, grade });
    const now = new Date();
    const dateStrings: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dateStrings.push(d.toISOString().split('T')[0]);
    }

    const startDate = dateStrings[0];
    const endDate = dateStrings[dateStrings.length - 1];

    const records = await this.attendance.findMany({ schoolId, startDate, endDate });
    const recordMap = new Map<string, AttendanceStatus>();

    for (const r of records) {
      recordMap.set(`${r.studentId}:${r.date}`, r.status);
    }

    const grid = students.map((s) => {
      const dayStatuses: Record<string, AttendanceStatus> = {};
      for (const d of dateStrings) {
        dayStatuses[d] = recordMap.get(`${s.id}:${d}`) || 'PRESENT'; // default present
      }

      return {
        studentId: s.id,
        name: s.name,
        prn: s.prn,
        grade: s.grade,
        statuses: dayStatuses,
      };
    });

    return {
      dates: dateStrings,
      grid,
    };
  }

  async refreshStudentAtRisk(studentId: string): Promise<void> {
    const student = await this.students.findById(studentId);
    if (!student) return;

    const allAttendance = await this.attendance.findMany({ studentId });
    const availableSchemes = await this.schemes.findMany();

    const evaluation = evaluateStudentAtRisk(student as any, allAttendance as any, availableSchemes as any);

    if (evaluation.isAtRisk) {
      const flags = createAtRiskEntities(student as any, evaluation, 'cloud');
      for (const flag of flags) {
        await this.atRisk.upsert({
          id: flag.id,
          schoolId: student.schoolId,
          studentId: student.id,
          ruleId: flag.ruleId,
          reason: flag.reason,
          attendancePercent: flag.attendancePercent,
          consecutiveAbsences: flag.consecutiveAbsences,
          suggestedSchemeIds: flag.suggestedSchemeIds as any,
          raisedAt: new Date(flag.raisedAt),
          deviceId: 'cloud',
          version: 1,
        });
      }
    }
  }
}

export const attendanceService = new AttendanceService();
