import { prisma } from '../db/prisma.js';

export class DistrictService {
  async getDistrictDashboard(districtId?: string) {
    // 1. Schools list with last sync time & staleness badge
    const schools = await prisma.school.findMany({
      where: {
        ...(districtId ? { districtId } : {}),
      },
      include: {
        devices: true,
        _count: {
          select: {
            students: { where: { deletedAt: null } },
            teachers: { where: { deletedAt: null } },
          },
        },
      },
    });

    const now = Date.now();
    const schoolsOverview = schools.map((s) => {
      // Find most recent device activity
      let lastSyncTime: Date | null = null;
      for (const d of s.devices) {
        if (!lastSyncTime || d.lastSeenAt > lastSyncTime) {
          lastSyncTime = d.lastSeenAt;
        }
      }

      const diffHours = lastSyncTime ? (now - lastSyncTime.getTime()) / (1000 * 60 * 60) : 999;
      let stalenessBadge: 'FRESH' | 'STALE' | 'OFFLINE_LONG' = 'OFFLINE_LONG';
      if (diffHours < 24) {
        stalenessBadge = 'FRESH';
      } else if (diffHours < 72) {
        stalenessBadge = 'STALE';
      }

      return {
        id: s.id,
        name: s.name,
        registerNo: s.registerNo,
        studentCount: s._count.students,
        teacherCount: s._count.teachers,
        lastSyncTime: lastSyncTime ? lastSyncTime.toISOString() : null,
        stalenessBadge,
      };
    });

    // 2. Learning-level distribution across students (Levels 1 to 5)
    const students = await prisma.studentProfile.findMany({
      where: {
        deletedAt: null,
        ...(districtId ? { school: { districtId } } : {}),
      },
      select: {
        assessedLevel: true,
        gender: true,
      },
    });

    const levelDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const stu of students) {
      const lvl = Math.max(1, Math.min(5, stu.assessedLevel || 1));
      levelDistribution[lvl] = (levelDistribution[lvl] || 0) + 1;
    }

    // 3. Quiz performance by subject
    const quizResults = await prisma.quizResult.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        quiz: { select: { subject: true } },
      },
    });

    const subjectScores: Record<string, { totalScore: number; maxScore: number; count: number }> = {};
    for (const res of quizResults) {
      const sub = res.quiz.subject;
      if (!subjectScores[sub]) {
        subjectScores[sub] = { totalScore: 0, maxScore: 0, count: 0 };
      }
      subjectScores[sub].totalScore += res.score;
      subjectScores[sub].maxScore += res.maxScore;
      subjectScores[sub].count += 1;
    }

    const performanceBySubject = Object.entries(subjectScores).map(([subject, data]) => ({
      subject,
      averagePercentage: data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 100) : 0,
      totalAttempts: data.count,
    }));

    // 4. Overall Attendance & At-Risk Counts
    const attendanceStats = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      _count: true,
    });

    let totalAttendance = 0;
    let presentCount = 0;
    for (const item of attendanceStats) {
      totalAttendance += item._count;
      if (item.status === 'PRESENT') {
        presentCount += item._count;
      }
    }
    const districtAttendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const activeAtRiskCount = await prisma.atRiskFlag.count({
      where: {
        deletedAt: null,
        resolvedAt: null,
      },
    });

    const completedChecklistsCount = await prisma.schemeChecklistProgress.count({
      where: {
        deletedAt: null,
        completed: true,
      },
    });

    return {
      schools: schoolsOverview,
      levelDistribution,
      performanceBySubject,
      attendancePercentage: districtAttendancePercent,
      activeAtRiskCount,
      completedChecklistsCount,
      totalStudents: students.length,
    };
  }

  async exportSchoolsCsv(districtId?: string): Promise<string> {
    const dashboard = await this.getDistrictDashboard(districtId);
    const headers = ['School ID', 'School Name', 'Register No', 'Students', 'Teachers', 'Last Sync', 'Status'];
    const rows = dashboard.schools.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.registerNo,
      s.studentCount,
      s.teacherCount,
      s.lastSyncTime || 'Never',
      s.stalenessBadge,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const districtService = new DistrictService();
