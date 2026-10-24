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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-600" />
            District Administrator Portal
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
            Pune Rural District • Real-Time Aggregated School Analytics
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* District KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">Total Enrolled</span>
          <div className="text-3xl font-black text-amber-950 mt-1">{dashboardData.totalStudents}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Across 2 schools</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">District Attendance</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{dashboardData.attendancePercentage}%</div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Target: 75%+</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">At-Risk Students</span>
          <div className="text-3xl font-black text-rose-600 mt-1">{dashboardData.activeAtRiskCount}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Action required</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">Schemes Ready</span>
          <div className="text-3xl font-black text-indigo-600 mt-1">{dashboardData.completedChecklistsCount}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Verified checklists</p>
        </div>
      </div>

      {/* Learning Level Distribution (Recharts) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md mb-6">
        <h3 className="font-extrabold text-lg text-amber-950 mb-1">
          Learning Competency Distribution (TaRL Levels 1-5)
        </h3>
        <p className="text-xs text-amber-800 font-medium mb-6">
          Distribution of student foundational literacy and numeracy across rural schools
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fde68a" />
              <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#78350f' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78350f' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '2px solid #f97316',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="count" fill="#ea580c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Schools Table with Staleness Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md">
        <h3 className="font-extrabold text-lg text-amber-950 mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-orange-600" />
          Participating Schools & Sync Staleness
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-amber-950">
            <thead className="bg-amber-50 uppercase font-black text-amber-800 text-[11px] border-b border-amber-200">
              <tr>
                <th className="p-3">School Name</th>
                <th className="p-3">Register No</th>
                <th className="p-3">Students</th>
                <th className="p-3">Teachers</th>
                <th className="p-3">Last Sync</th>
                <th className="p-3">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 font-medium">
              {dashboardData.schools.map((school: any) => (
                <tr key={school.id} className="hover:bg-amber-50/50 transition-all">
                  <td className="p-3 font-bold">{school.name}</td>
                  <td className="p-3 text-amber-800">{school.registerNo}</td>
                  <td className="p-3 font-bold">{school.studentCount}</td>
                  <td className="p-3">{school.teacherCount}</td>
                  <td className="p-3 text-slate-600">
                    {school.lastSyncTime ? new Date(school.lastSyncTime).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        school.stalenessBadge === 'FRESH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : school.stalenessBadge === 'STALE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
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
