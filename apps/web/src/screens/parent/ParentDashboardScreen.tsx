import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { offlineDb } from '../../db/offline-db.js';
import { StudentProfile } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Bell,
  Star,
  BookOpen,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export const ParentDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [attendancePercent, setAttendancePercent] = useState<number>(88);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadChildData() {
      const students = await offlineDb.students.toArray();
      const child = students.find((s) => s.name.includes('Aarav') || s.name.includes('Pooja')) || students[0];
      if (child) {
        setStudent(child);
        const attendance = await offlineDb.attendance.where('studentId').equals(child.id).toArray();
        if (attendance.length > 0) {
          const present = attendance.filter((a) => a.status === 'PRESENT').length;
          setAttendancePercent(Math.round((present / attendance.length) * 100));
        }
      }

      setNotifications([
        {
          id: 'notif-1',
          type: 'SCHEME_ELIGIBLE',
          title: 'Direct Benefit Transfer (DBT) Scheme Verified',
          message: 'Free uniform and textbook grant checklist verified by Headmaster. DBT transfer initiated to guardian account.',
          channelUsed: 'SMS Alert',
          date: 'Yesterday at 4:15 PM',
        },
        {
          id: 'notif-2',
          type: 'ASSESSMENT_REPORT',
          title: 'Shabash! Promoted to Level 3 in Marathi & Math',
          message: 'Continuous assessment confirmed mastery in 2-digit arithmetic and paragraph reading.',
          channelUsed: 'On-Device Digest',
          date: '3 days ago',
        },
      ]);
    }
    loadChildData();
  }, []);

  const attendanceData = [
    { name: 'Present', value: attendancePercent, color: '#34c759' },
    { name: 'Absent', value: 100 - attendancePercent, color: '#e2e8f0' },
  ];

  const subjectScores = [
    { subject: 'Marathi', score: 85 },
    { subject: 'Math', score: 78 },
    { subject: 'English', score: 72 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6 animate-chart-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Guardian & Parent Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Child Academic Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time offline attendance telemetry, competency milestones, and school notifications
          </p>
        </div>

        <AudioHelpButton text="पालक पोर्टल. आपल्या पाल्याची उपस्थिती, शैक्षणिक प्रगती आणि शासकीय योजनांची माहिती." size="sm" />
      </div>

      {student && (
        <>
          {/* Child Profile Card: Apple Squircle */}
          <div className="apple-card rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {student.name.charAt(0)}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Student Record • Grade {student.grade}
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  {student.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">PRN: {student.prn}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-[18px] bg-blue-500/10 border border-blue-500/20 text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Competency</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">Level {student.assessedLevel}</span>
              </div>

              <div className="px-4 py-2.5 rounded-[18px] bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Attendance</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">{attendancePercent}%</span>
              </div>
            </div>
          </div>

          {/* Visual Analytics Row: Animated Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance Donut Chart */}
            <div className="apple-card rounded-[28px] p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Monthly Attendance Rate
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recorded locally on classroom tablet during morning roll call
                </p>
              </div>

              <div className="h-44 w-full relative flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={true}
                      animationDuration={1100}
                      animationEasing="ease-out"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{attendancePercent}%</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Present</span>
                </div>
              </div>

              <div className="flex items-center justify-around text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Present ({attendancePercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-slate-400">Absent ({100 - attendancePercent}%)</span>
                </div>
              </div>
            </div>

            {/* Subject Competency Bar Chart */}
            <div className="apple-card rounded-[28px] p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Subject Score Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Evaluation results from offline weekly quiz submissions
                </p>
              </div>

              <div className="h-44 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectScores} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="parentSubjectGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0071e3" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="apple-glass rounded-[14px] px-3 py-1.5 shadow-lg text-xs border border-black/10 dark:border-white/10">
                              <span className="font-bold text-slate-900 dark:text-white block">{data.subject}</span>
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">{data.score}% Mastery</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="score"
                      fill="url(#parentSubjectGrad)"
                      radius={[8, 8, 3, 3]}
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Minimum Target: 60%</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Exceeding Targets</span>
              </div>
            </div>
          </div>

          {/* School Communications Feed */}
          <div className="apple-card rounded-[28px] p-6 sm:p-8">
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              School Notices & Verification Alerts
            </h3>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 sm:p-5 rounded-[20px] bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                    <span className="text-[11px] text-slate-400 font-normal">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">{n.message}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    <Smartphone className="w-3 h-3" />
                    <span>Delivered via: {n.channelUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
