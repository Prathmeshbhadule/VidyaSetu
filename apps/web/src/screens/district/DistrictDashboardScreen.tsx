import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, Download, School, AlertTriangle, CheckCircle2, Clock, Users } from 'lucide-react';

export const DistrictDashboardScreen: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>({
    schools: [
      {
        id: 'sch-01',
        name: 'Zilla Parishad Primary School Khed',
        registerNo: 'ZP-KHED-0102',
        studentCount: 20,
        teacherCount: 2,
        lastSyncTime: new Date().toISOString(),
        stalenessBadge: 'FRESH',
      },
      {
        id: 'sch-02',
        name: 'Zilla Parishad High School Shirur',
        registerNo: 'ZP-SHIRUR-0205',
        studentCount: 10,
        teacherCount: 2,
        lastSyncTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        stalenessBadge: 'STALE',
      },
    ],
    levelDistribution: { 1: 3, 2: 6, 3: 11, 4: 7, 5: 3 },
    performanceBySubject: [
      { subject: 'LANGUAGE', averagePercentage: 78, totalAttempts: 45 },
      { subject: 'MATH', averagePercentage: 69, totalAttempts: 42 },
      { subject: 'SCIENCE', averagePercentage: 81, totalAttempts: 38 },
    ],
    attendancePercentage: 82,
    activeAtRiskCount: 1,
    completedChecklistsCount: 14,
    totalStudents: 30,
  });

  const chartData = [
    { level: 'Level 1 (Beginner)', count: dashboardData.levelDistribution[1] || 0 },
    { level: 'Level 2 (Word)', count: dashboardData.levelDistribution[2] || 0 },
    { level: 'Level 3 (Paragraph)', count: dashboardData.levelDistribution[3] || 0 },
    { level: 'Level 4 (Story)', count: dashboardData.levelDistribution[4] || 0 },
    { level: 'Level 5 (Advanced)', count: dashboardData.levelDistribution[5] || 0 },
  ];

  const handleExportCsv = () => {
    const headers = ['School ID', 'School Name', 'Register No', 'Students', 'Teachers', 'Last Sync', 'Status'];
    const rows = dashboardData.schools.map((s: any) => [
      s.id,
      `"${s.name}"`,
      s.registerNo,
      s.studentCount,
      s.teacherCount,
      s.lastSyncTime,
      s.stalenessBadge,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'district_schools_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-36">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700 mb-2">
            <School className="w-3.5 h-3.5 text-blue-600" />
            <span>District Administration Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Pune Rural District Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Real-Time Aggregated School Analytics, Learning Progress & Offline Sync Staleness
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-sm hover:shadow transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* District KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Total Enrolled</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{dashboardData.totalStudents}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Across 2 schools</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">District Attendance</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{dashboardData.attendancePercentage}%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Target: 75%+</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">At-Risk Students</span>
          <div className="text-3xl font-black text-rose-600 mt-1">{dashboardData.activeAtRiskCount}</div>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Intervention required</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Schemes Ready</span>
          <div className="text-3xl font-black text-blue-600 mt-1">{dashboardData.completedChecklistsCount}</div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">Verified checklists</p>
        </div>
      </div>

      {/* Learning Level Distribution (Recharts) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-6">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Learning Competency Distribution (TaRL Levels 1-5)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Distribution of student foundational literacy and numeracy across rural school batches
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
            Pratham TaRL Standard
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ color: '#93c5fd', fontWeight: 600 }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Schools Table with Staleness Badges */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" />
            Participating Schools & Sync Staleness
          </h3>
          <span className="text-xs text-slate-500 font-medium">Auto-syncs via Hub Wi-Fi mesh</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 font-bold text-slate-700 text-[11px] border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">School Name</th>
                <th className="p-3.5">Register No</th>
                <th className="p-3.5">Students</th>
                <th className="p-3.5">Teachers</th>
                <th className="p-3.5">Last Sync</th>
                <th className="p-3.5">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dashboardData.schools.map((school: any) => (
                <tr key={school.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{school.name}</td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{school.registerNo}</td>
                  <td className="p-3.5 font-bold text-slate-900">{school.studentCount}</td>
                  <td className="p-3.5 text-slate-600">{school.teacherCount}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {school.lastSyncTime ? new Date(school.lastSyncTime).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        school.stalenessBadge === 'FRESH'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : school.stalenessBadge === 'STALE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {school.stalenessBadge === 'FRESH' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>{school.stalenessBadge}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
