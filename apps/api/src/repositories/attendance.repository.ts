import { prisma } from '../db/prisma.js';
import { AttendanceRecord, Prisma } from '@prisma/client';

export interface AttendanceFilter {
  schoolId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export class AttendanceRepository {
  async findMany(filter: AttendanceFilter = {}): Promise<AttendanceRecord[]> {
    const { schoolId, studentId, startDate, endDate } = filter;

    return prisma.attendanceRecord.findMany({
      where: {
        deletedAt: null,
        ...(schoolId ? { schoolId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: 'asc' },
    });
  }

  async findByStudentAndDate(studentId: string, date: string): Promise<AttendanceRecord | null> {
    return prisma.attendanceRecord.findUnique({
      where: {
        studentId_date: { studentId, date },
      },
    });
  }

  async upsert(data: Prisma.AttendanceRecordUncheckedCreateInput): Promise<AttendanceRecord> {
    return prisma.attendanceRecord.upsert({
      where: {
        studentId_date: { studentId: data.studentId, date: data.date },
      },
      create: data,
      update: {
        status: data.status,
        markedBy: data.markedBy,
        source: data.source,
        note: data.note,
        hlc: data.hlc,
        deviceId: data.deviceId,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async bulkUpsert(records: Prisma.AttendanceRecordUncheckedCreateInput[]): Promise<number> {
    let count = 0;
    for (const record of records) {
      await this.upsert(record);
      count++;
    }
    return count;
  }
}

export const attendanceRepository = new AttendanceRepository();
