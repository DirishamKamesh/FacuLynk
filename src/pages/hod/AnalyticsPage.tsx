import React from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { getMaxHoursByDesignation } from '../../utils/workloadCalculator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#172554', '#0F766E', '#1E3A8A', '#15803D', '#B45309'];

export const AnalyticsPage: React.FC = () => {
  const { faculty, tasks } = useData();

  // 1. Centralized Department Metrics
  const totalAssignedHours = faculty.reduce((acc, f) => acc + f.currentWorkloadHours, 0);
  const totalMaxCapacity = faculty.reduce((acc, f) => acc + f.maxWorkloadHours, 0);
  const facultyUtilization = totalMaxCapacity > 0 ? ((totalAssignedHours / totalMaxCapacity) * 100).toFixed(1) : '0.0';

  const overloadedCount = faculty.filter(
    (f) => f.status === 'Overloaded'
  ).length;

  const balancedCount = faculty.filter(
    (f) => f.status === 'Balanced'
  ).length;

  const unassignedHours = tasks
    .filter((t) => !t.assignedFacultyId)
    .reduce((acc, t) => acc + t.weeklyHours, 0);

  const departmentMetrics = [
    {
      metric: 'Faculty Utilization',
      value: `${facultyUtilization}%`,
      change: `${totalAssignedHours}/${totalMaxCapacity} hrs`,
      isPositive: true,
    },
    {
      metric: 'Overloaded Faculty',
      value: overloadedCount,
      change: `${overloadedCount} above quota limit`,
      isPositive: overloadedCount === 0,
    },
    {
      metric: 'Total Assigned Hours',
      value: `${totalAssignedHours} hrs/wk`,
      change: `${faculty.length} active faculty`,
      isPositive: true,
    },
    {
      metric: 'Unassigned Backlog',
      value: `${unassignedHours} hrs/wk`,
      change: `${tasks.filter((t) => !t.assignedFacultyId).length} tasks pending`,
      isPositive: unassignedHours === 0,
    },
  ];

  // 2. Workload Distribution by Designation
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor'] as const;
  const workloadByDesignation = designations.map((desig) => {
    const group = faculty.filter((f) => f.designation === desig);
    const maxLimit = getMaxHoursByDesignation(desig);
    const totalHours = group.reduce((acc, f) => acc + f.currentWorkloadHours, 0);
    const avgHours = group.length > 0 ? Number((totalHours / group.length).toFixed(1)) : 0;
    return {
      designation: desig,
      avgHours,
      maxLimit,
      facultyCount: group.length,
    };
  });

  // 3. Task Type Allocation Breakdown
  const categories = ['Lecture', 'Lab', 'Admin', 'Research', 'Mentorship'] as const;
  const taskTypeDistribution = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.type === cat);
    const hours = catTasks.reduce((acc, t) => acc + t.weeklyHours, 0);
    return {
      type: cat,
      hours,
      taskCount: catTasks.length,
    };
  });

  // 4. Semester Workload Evolution
  const weeklyTrends = [
    { week: 'Week 1', totalWorkloadHours: 92, overloadedCount: 3, balancedCount: 3 },
    { week: 'Week 2', totalWorkloadHours: 98, overloadedCount: 3, balancedCount: 3 },
    { week: 'Week 3', totalWorkloadHours: 102, overloadedCount: 2, balancedCount: 2 },
    { week: 'Week 4 (Active)', totalWorkloadHours: totalAssignedHours, overloadedCount, balancedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Institutional Analytics & Metrics Matrix</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Department-wide load distribution, task categorizations, and semester capacity trends
          </p>
        </div>
      </div>

      {/* Metrics Row - 2x2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {departmentMetrics.map((m) => (
          <Card key={m.metric} bodyClassName="p-3 sm:p-4">
            <span className="text-3xs sm:text-2xs font-bold text-[#64748B] uppercase tracking-wider block truncate">{m.metric}</span>
            <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-1">
              <span className="text-xl sm:text-2xl font-bold text-[#1E293B]">{m.value}</span>
              <span
                className={`text-3xs sm:text-2xs font-semibold px-1.5 py-0.5 rounded border ${
                  m.isPositive
                    ? 'text-[#15803D] bg-emerald-50 border-emerald-200'
                    : 'text-[#B91C1C] bg-rose-50 border-rose-200'
                }`}
              >
                {m.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Designation Workload Distribution */}
        <Card
          title="Average Workload vs Statutory Capacity by Designation"
          subtitle="Professors (10h max), Assoc Profs (16h max), Asst Profs (20h max)"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadByDesignation} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="designation" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="avgHours" name="Average Assigned Hours" fill="#172554" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxLimit" name="Designation Quota Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Task Type Categorization Donut Chart */}
        <Card title="Task Allocation Breakdown by Category" subtitle="Distribution across Lectures, Labs, Admin, Research, Mentorship">
          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="hours"
                  nameKey="type"
                >
                  {taskTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} hrs`, 'Workload']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-2xs text-slate-600 border-t border-slate-100 pt-2 font-mono">
            {taskTypeDistribution.map((entry, index) => (
              <span key={entry.type} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.type}: {entry.hours}h ({entry.taskCount} tasks)
              </span>
            ))}
          </div>
        </Card>

        {/* Chart 3: Weekly Workload & Overload Trend Line */}
        <Card title="Semester Workload Evolution & Overload Trend" subtitle="Semester progression leading to active state" className="lg:col-span-2">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="totalWorkloadHours" name="Total Department Hours" stroke="#1e293b" strokeWidth={2} />
                <Line type="monotone" dataKey="overloadedCount" name="Overloaded Faculty Count" stroke="#e11d48" strokeWidth={2} />
                <Line type="monotone" dataKey="balancedCount" name="Balanced Faculty Count" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
