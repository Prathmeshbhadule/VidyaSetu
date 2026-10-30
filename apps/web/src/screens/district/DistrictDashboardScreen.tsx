import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  School,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  BookOpen,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Award,
} from 'lucide-react';

export const DistrictDashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'levels' | 'subjects' | 'staleness'>('levels');

  const [dashboardData] = useState<any>({
    schools: [
      {
        id: 'sch-01',
        name: 'Zilla Parishad Primary School Khed',
        registerNo: 'ZP-KHED-0102',
        studentCount: 20,
        teacherCount: 2,
        lastSyncTime: new Date().toISOString(),
        stalenessBadge: 'FRESH',
        syncLagMinutes: 4,
      },
      {
        id: 'sch-02',
        name: 'Zilla Parishad High School Shirur',
        registerNo: 'ZP-SHIRUR-0205',
        studentCount: 10,
        teacherCount: 2,
        lastSyncTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        stalenessBadge: 'STALE',
        syncLagMinutes: 2160,
      },
      {
        id: 'sch-03',
        name: 'ZP Ashram Shala Junnar',
        registerNo: 'ZP-JUNN-0418',
        studentCount: 18,
        teacherCount: 3,
        lastSyncTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        stalenessBadge: 'FRESH',
        syncLagMinutes: 45,
      },
    ],
    levelDistribution: { 1: 3, 2: 6, 3: 11, 4: 7, 5: 3 },
    performanceBySubject: [
      { subject: 'Marathi (भाषा)', averagePercentage: 82, totalAttempts: 45, benchmark: 75 },
      { subject: 'Math (गणित)', averagePercentage: 71, totalAttempts: 42, benchmark: 70 },
      { subject: 'English (इंग्रजी)', averagePercentage: 66, totalAttempts: 39, benchmark: 65 },
      { subject: 'Science (विज्ञान)', averagePercentage: 84, totalAttempts: 38, benchmark: 75 },
    ],
    attendancePercentage: 84,
    activeAtRiskCount: 1,
    completedChecklistsCount: 14,
    totalStudents: 48,
  });

  const chartData = [
    { level: 'L1: Beginner', count: dashboardData.levelDistribution[1] || 0, color: '#3b82f6' },
    { level: 'L2: Word', count: dashboardData.levelDistribution[2] || 0, color: '#2563eb' },
    { level: 'L3: Paragraph', count: dashboardData.levelDistribution[3] || 0, color: '#4f46e5' },
    { level: 'L4: Story', count: dashboardData.levelDistribution[4] || 0, color: '#7c3aed' },
    { level: 'L5: Advanced', count: dashboardData.levelDistribution[5] || 0, color: '#059669' },
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
    link.setAttribute('download', `pune_district_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36 animate-chart-enter">
      {/* Apple-style Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5">
            <School className="w-3.5 h-3.5" />
            <span>District Administrative Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pune Rural District
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal mt-1 max-w-2xl">
            Real-time telemetry across rural ZP schools, student mastery trajectories, and offline mesh synchronization staleness.
          </p>
        </div>

        {/* Action Button: Apple Spring Button */}
        <button
          onClick={handleExportCsv}
          className="apple-press inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-xs shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Export District Digest</span>
        </button>
      </div>

      {/* KPI Cards: Apple Squircle Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1 */}
        <div className="apple-card rounded-[24px] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Enrolled</span>
            <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {dashboardData.totalStudents}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            <span>Across 3 rural clusters</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="apple-card rounded-[24px] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">District Attendance</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {dashboardData.attendancePercentage}%
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
            <span>+4.2% above state benchmark</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="apple-card rounded-[24px] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">At-Risk Interventions</span>
            <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {dashboardData.activeAtRiskCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            <span>1 student flagged (consecutive absences)</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="apple-card rounded-[24px] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Welfare Schemes</span>
            <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
            {dashboardData.completedChecklistsCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            <span>Ready for DBT disbursement</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="apple-card rounded-[28px] p-6 sm:p-8 mb-8 relative">
        {/* Apple Segmented Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'levels'
                  ? 'Foundational Competency Distribution'
                  : activeTab === 'subjects'
                  ? 'Curriculum Subject Mastery'
                  : 'Sync Staleness Telemetry'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              {activeTab === 'levels'
                ? 'Pratham TaRL Level 1 to 5 breakdown across participating students'
                : activeTab === 'subjects'
                ? 'Average student assessment scores vs state minimum targets'
                : 'Last sync duration and offline packet queue metrics'}
            </p>
          </div>

          {/* Apple Segmented Pill Switcher */}
          <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('levels')}
              className={`apple-segment-item px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'levels'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              TaRL Levels
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`apple-segment-item px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'subjects'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Subjects
            </button>
          </div>
        </div>

        {/* Chart View with Fluid Animated Recharts */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'levels' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="appleBlueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.75} />
                  </linearGradient>
                  <linearGradient id="appleEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                  dataKey="level"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="apple-glass rounded-[16px] px-3.5 py-2.5 shadow-xl border border-black/10 dark:border-white/10 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white">{data.level}</p>
                          <p className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                            {data.count} {data.count === 1 ? 'Student' : 'Students'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[10, 10, 3, 3]}
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 4 ? 'url(#appleEmeraldGrad)' : 'url(#appleBlueGrad)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={dashboardData.performanceBySubject}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="appleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0071e3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="apple-glass rounded-[16px] px-3.5 py-2.5 shadow-xl border border-black/10 dark:border-white/10 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white">{data.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              Avg: {data.averagePercentage}%
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">Benchmark: {data.benchmark}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="averagePercentage"
                  stroke="#0071e3"
                  strokeWidth={3}
                  fill="url(#appleAreaGrad)"
                  isAnimationActive={true}
                  animationDuration={1300}
                  animationEasing="ease-out"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Participating Schools Table */}
      <div className="apple-card rounded-[28px] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Participating Schools & Sync Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hub mesh nodes synchronizing locally via Sneakernet USB or cellular WAN
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            3 Active Nodes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">School Name</th>
                <th className="pb-3 px-3">UDISE / Register</th>
                <th className="pb-3 px-3">Students</th>
                <th className="pb-3 px-3">Teachers</th>
                <th className="pb-3 px-3">Last Sync</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {dashboardData.schools.map((school: any) => (
                <tr key={school.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {school.name}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                    {school.registerNo}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                    {school.studentCount}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {school.teacherCount}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {school.lastSyncTime ? new Date(school.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        school.stalenessBadge === 'FRESH'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {school.stalenessBadge === 'FRESH' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{school.stalenessBadge === 'FRESH' ? 'Live' : 'Stale (36h)'}</span>
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
