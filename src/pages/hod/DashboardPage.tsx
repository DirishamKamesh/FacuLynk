import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { WorkloadProgressBar } from '../../components/common/WorkloadProgressBar';
import { Task } from '../../types/task';
import { Faculty } from '../../types/faculty';
import {
  calculateAvailableHours,
  calculateExcessHours,
  calculateUtilization,
} from '../../utils/workloadCalculator';
import {
  Users,
  ShieldAlert,
  CheckCircle,
  Clock,
  ArrowUpRight,
  BarChart2,
  GitPullRequest,
  ChevronRight,
  X,
  Award,
  CheckSquare,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { faculty, tasks, recommendations } = useData();
  const navigate = useNavigate();

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  // Dynamic calculations derived from single source of truth (faculty array)
  const totalFaculty = faculty.length;

  const overloadedFaculty = faculty.filter(
    (f) => f.status === 'Overloaded'
  );
  const balancedFaculty = faculty.filter(
    (f) => f.status === 'Balanced'
  );
  const underloadedFaculty = faculty.filter(
    (f) => f.status === 'Underloaded'
  );

  const overloadedCount = overloadedFaculty.length;
  const balancedCount = balancedFaculty.length;
  const underloadedCount = underloadedFaculty.length;

  const pendingRecsCount = recommendations.filter((r) => r.status === 'Pending').length;

  // Overloaded summary text
  const overloadedNames = overloadedFaculty.map((f) => f.name).join(' and ');
  const totalExcessHours = overloadedFaculty.reduce(
    (sum, f) => sum + calculateExcessHours(f.currentWorkloadHours, f.maxWorkloadHours),
    0
  );

  // Sort faculty by workload severity (Overloaded -> Balanced -> Underloaded, then by utilization descending)
  const sortedChartFaculty = [...faculty].sort((a, b) => {
    const statusA = a.status;
    const statusB = b.status;

    const statusRank: Record<string, number> = { Overloaded: 1, Balanced: 2, Underloaded: 3 };
    const rankA = statusRank[statusA] || 4;
    const rankB = statusRank[statusB] || 4;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    const utilA = calculateUtilization(a.currentWorkloadHours, a.maxWorkloadHours);
    const utilB = calculateUtilization(b.currentWorkloadHours, b.maxWorkloadHours);
    return utilB - utilA;
  });

  // Decision support metrics for right-column Capacity Summary & Status Panel
  const totalAvailableCapacity = faculty.reduce(
    (sum, f) => sum + calculateAvailableHours(f.currentWorkloadHours, f.maxWorkloadHours),
    0
  );

  const totalOverloadedHours = faculty.reduce(
    (sum, f) => sum + calculateExcessHours(f.currentWorkloadHours, f.maxWorkloadHours),
    0
  );

  const netAvailableCapacity = totalAvailableCapacity - totalOverloadedHours;

  // Prioritized decision support faculty: Overloaded first, then faculty with highest available capacity
  const prioritizedRightColumnFaculty = [...faculty]
    .sort((a, b) => {
      const statusA = a.status;
      const statusB = b.status;

      if (statusA === 'Overloaded' && statusB !== 'Overloaded') return -1;
      if (statusA !== 'Overloaded' && statusB === 'Overloaded') return 1;

      if (statusA === 'Overloaded' && statusB === 'Overloaded') {
        const excessA = calculateExcessHours(a.currentWorkloadHours, a.maxWorkloadHours);
        const excessB = calculateExcessHours(b.currentWorkloadHours, b.maxWorkloadHours);
        return excessB - excessA;
      }

      const availA = calculateAvailableHours(a.currentWorkloadHours, a.maxWorkloadHours);
      const availB = calculateAvailableHours(b.currentWorkloadHours, b.maxWorkloadHours);
      return availB - availA;
    })
    .slice(0, 3);

  // Top 3 active assignments for compact viewport density
  const topActiveAssignments = tasks.filter((t) => t.status === 'Assigned').slice(0, 3);

  // Faculty assigned tasks helper for detail modal
  const getFacultyAssignedTasks = (facultyId: string) => {
    return tasks.filter((t) => t.assignedFacultyId === facultyId);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">HOD Executive Dashboard</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Department Workload Balances, Quota Limits, & Optimization Overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/hod/simulator')}
            icon={<BarChart2 className="w-4 h-4 text-[#1E2A55]" />}
          >
            Run What-If Scenario
          </Button>
          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/hod/recommendations')}
            icon={<GitPullRequest className="w-4 h-4" />}
          >
            View Workload Recommendations ({pendingRecsCount})
          </Button>
        </div>
      </div>

      {/* KPI Grid - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Faculty */}
        <Card bodyClassName="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs sm:text-2xs font-bold text-[#64748B] uppercase tracking-wider">Total Faculty</span>
            <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg text-[#1E2A55]">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{totalFaculty}</span>
            <span className="text-3xs sm:text-xs text-[#64748B] font-medium hidden xs:inline">Active instructors</span>
          </div>
        </Card>

        {/* KPI 2: Overloaded */}
        <Card bodyClassName="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs sm:text-2xs font-bold text-[#B91C1C] uppercase tracking-wider">Overloaded</span>
            <div className="p-1.5 sm:p-2 bg-red-100/70 rounded-lg text-[#B91C1C]">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#B91C1C]">{overloadedCount}</span>
            <span className="text-3xs sm:text-xs text-[#B91C1C] font-semibold hidden xs:inline">Over quota limit</span>
          </div>
        </Card>

        {/* KPI 3: Balanced */}
        <Card bodyClassName="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs sm:text-2xs font-bold text-[#15803D] uppercase tracking-wider">Balanced</span>
            <div className="p-1.5 sm:p-2 bg-emerald-100/70 rounded-lg text-[#15803D]">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#15803D]">{balancedCount}</span>
            <span className="text-3xs sm:text-xs text-[#15803D] font-semibold hidden xs:inline">Target capacity</span>
          </div>
        </Card>

        {/* KPI 4: Underloaded */}
        <Card bodyClassName="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs sm:text-2xs font-bold text-[#B45309] uppercase tracking-wider">Underloaded</span>
            <div className="p-1.5 sm:p-2 bg-amber-100/70 rounded-lg text-[#B45309]">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#B45309]">{underloadedCount}</span>
            <span className="text-3xs sm:text-xs text-[#B45309] font-semibold hidden xs:inline">Available hours</span>
          </div>
        </Card>
      </div>

      {/* Overloaded Alert Banner */}
      {overloadedCount > 0 && (
        <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-[#B91C1C] rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#B91C1C]">
                Workload Imbalance Alert: {overloadedCount} Faculty Member{overloadedCount > 1 ? 's' : ''} Over Capacity
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                {overloadedNames} exceed statutory capacity quotas (+{totalExcessHours} hours combined excess). Rebalancing is recommended.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/hod/recommendations')}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            View Workload Recommendations
          </Button>
        </div>
      )}

      {/* Main Visual Content: Workload Chart & Faculty Workload Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Horizontal Workload Capacity / Bullet Chart */}
        <Card
          title="Faculty Workload Capacity Matrix"
          subtitle="Horizontal capacity bars vs individual designation quota limits"
          className="lg:col-span-2"
        >
          {/* Header Explanation & Compact Designation Quota Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#E2E8F0] text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#1E293B] rounded-xs inline-block" />
              <span className="font-semibold text-[#1E293B]">Marker (│) = designation workload limit</span>
            </div>
            <div className="flex items-center gap-2.5 text-3xs sm:text-2xs font-mono font-medium text-[#64748B]">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Professor: 10h</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Associate: 16h</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Assistant: 20h</span>
            </div>
          </div>

          {/* Sorted Horizontal Bullet Rows */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-0.5">
            {sortedChartFaculty.map((f) => {
              const status = f.status;
              const util = calculateUtilization(f.currentWorkloadHours, f.maxWorkloadHours);
              const excess = calculateExcessHours(f.currentWorkloadHours, f.maxWorkloadHours);
              const available = calculateAvailableHours(f.currentWorkloadHours, f.maxWorkloadHours);

              // Row scale adapted strictly to the user's profession limit (Professor=10h, Associate=16h, Assistant=20h)
              const rowScale = Math.max(f.maxWorkloadHours, f.currentWorkloadHours);
              const limitPercent = Math.min(100, (f.maxWorkloadHours / rowScale) * 100);
              const barWidthPercent = Math.min(100, (f.currentWorkloadHours / rowScale) * 100);

              const statusColorHex =
                status === 'Overloaded'
                  ? '#B91C1C'
                  : status === 'Balanced'
                  ? '#15803D'
                  : '#B45309';

              const statusBadgeBg =
                status === 'Overloaded'
                  ? 'bg-rose-50 text-[#B91C1C] border-rose-200'
                  : status === 'Balanced'
                  ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                  : 'bg-amber-50 text-[#B45309] border-amber-200';

              return (
                <div
                  key={f.id}
                  className="p-2.5 bg-slate-50/70 hover:bg-slate-100/80 border border-[#E2E8F0] rounded-xl transition-colors space-y-1.5"
                >
                  {/* Row Top Info Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    {/* Faculty Name & Designation */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1E293B] text-xs sm:text-sm truncate">{f.name}</span>
                      </div>
                      <span className="text-3xs sm:text-2xs text-[#64748B] font-medium block">
                        {f.designation} · {f.department}
                      </span>
                    </div>

                    {/* Metrics & Status Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <div className="text-left sm:text-right font-mono text-xs">
                        <span className="font-bold text-[#1E293B]">
                          {f.currentWorkloadHours} / {f.maxWorkloadHours} hrs
                        </span>
                        <span className="text-[#64748B] ml-1.5 font-semibold text-2xs">({util}%)</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider border shrink-0 ${statusBadgeBg}`}
                      >
                        {status === 'Overloaded'
                          ? `OVERLOADED (+${excess}h)`
                          : status === 'Balanced'
                          ? `BALANCED (${available}h avail)`
                          : `UNDERLOADED (${available}h avail)`}
                      </span>
                    </div>
                  </div>

                  {/* Bullet / Capacity Bar */}
                  <div className="relative w-full h-5 bg-slate-200/80 rounded-md overflow-hidden flex items-center border border-slate-300/60">
                    {/* Filled Workload Bar */}
                    <div
                      className="h-full transition-all duration-300 rounded-l-md"
                      style={{
                        width: `${barWidthPercent}%`,
                        backgroundColor: statusColorHex,
                      }}
                      title={`${f.name}: ${f.currentWorkloadHours} hrs assigned (${util}%)`}
                    />

                    {/* Individual Faculty Designation Quota Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#1E293B] z-10 shadow-xs"
                      style={{ left: `calc(${limitPercent}% - 2px)` }}
                      title={`${f.designation} Quota Limit: ${f.maxWorkloadHours} hrs`}
                    >
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#1E293B] rounded-t-xs" />
                    </div>
                  </div>

                  {/* Axis scale label ticks */}
                  <div className="flex items-center justify-between text-3xs font-mono text-[#64748B] px-0.5 pt-0.5">
                    <span>0h</span>
                    <span className="font-bold text-[#1E293B]">
                      │ Limit: {f.maxWorkloadHours}h ({f.designation.split(' ')[0]})
                    </span>
                    <span className="font-semibold text-slate-700">
                      {f.currentWorkloadHours > f.maxWorkloadHours
                        ? `${rowScale}h Workload Scale`
                        : `${f.maxWorkloadHours}h ${f.designation.split(' ')[0]} Scale`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Decision Support Panel */}
        <Card
          title="Faculty Workload Status"
          subtitle="Prioritized key focus: Overloaded & high capacity"
          action={
            <button
              type="button"
              onClick={() => navigate('/hod/faculty')}
              className="text-2xs font-bold text-[#0F766E] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View All Faculty →
            </button>
          }
        >
          <div className="space-y-2.5">
            {prioritizedRightColumnFaculty.map((f) => {
              const util = calculateUtilization(f.currentWorkloadHours, f.maxWorkloadHours);
              const status = f.status;
              const excess = calculateExcessHours(f.currentWorkloadHours, f.maxWorkloadHours);
              const available = calculateAvailableHours(f.currentWorkloadHours, f.maxWorkloadHours);

              const cardBorderClass =
                status === 'Overloaded'
                  ? 'border-rose-200 bg-rose-50/40'
                  : status === 'Balanced'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-amber-200 bg-amber-50/30';

              return (
                <div
                  key={f.id}
                  className={`p-3 rounded-xl border ${cardBorderClass} transition-colors space-y-1.5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#1E293B]">{f.name}</p>
                      <p className="text-3xs text-[#64748B] font-medium">{f.designation}</p>
                    </div>
                    <Badge status={status} />
                  </div>

                  <div className="flex items-center justify-between text-2xs pt-1 border-t border-slate-200/60 font-mono">
                    <span className="text-[#1E293B] font-bold">
                      {f.currentWorkloadHours} / {f.maxWorkloadHours} hrs ({util}%)
                    </span>
                    <span
                      className={`font-bold ${
                        status === 'Overloaded'
                          ? 'text-[#B91C1C]'
                          : status === 'Balanced'
                          ? 'text-[#15803D]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {status === 'Overloaded' ? `+${excess} hrs over limit` : `${available} hrs available`}
                    </span>
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFaculty(f)}
                      className="text-3xs text-[#0F766E] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CAPACITY SUMMARY */}
          <div className="mt-4 pt-3.5 border-t border-[#E2E8F0]">
            <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-3xs font-extrabold text-[#1E293B] uppercase tracking-wider">
                  Capacity Summary
                </h4>
                <span className="text-3xs font-mono text-slate-500 font-semibold">Dept Total</span>
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Available capacity</span>
                  <span className="font-mono font-bold text-[#15803D]">{totalAvailableCapacity} hrs</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Overloaded capacity</span>
                  <span className="font-mono font-bold text-[#B91C1C]">{totalOverloadedHours} hrs</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                  <span className="font-bold text-[#1E293B]">Net available capacity</span>
                  <span
                    className={`font-mono font-extrabold ${
                      netAvailableCapacity >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                    }`}
                  >
                    {netAvailableCapacity} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="mt-4 pt-1">
            <Button
              variant="teal"
              className="w-full justify-center text-xs py-2.5 shadow-xs"
              onClick={() => navigate('/hod/recommendations')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              View Workload Recommendations →
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Assignments Table */}
      <Card
        title="Active Academic Task Assignments"
        subtitle="Top active course sections, laboratory supervision, and administrative assignments"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/hod/assignments')}
            icon={<ChevronRight className="w-4 h-4 text-[#0F766E]" />}
          >
            View all assignments →
          </Button>
        }
      >
        <Table<Task>
          data={topActiveAssignments}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Task Title',
              accessor: (item) => (
                <div>
                  <p className="font-semibold text-[#1E293B]">{item.title}</p>
                  <p className="text-2xs text-[#64748B] font-mono">{item.courseCode || item.type}</p>
                </div>
              ),
            },
            {
              header: 'Type',
              accessor: (item) => <Badge taskType={item.type} />,
            },
            {
              header: 'Assigned Faculty',
              accessor: (item) => (
                <span className="font-medium text-[#1E293B]">{item.assignedFacultyName || 'Unassigned'}</span>
              ),
            },
            {
              header: 'Weekly Hours',
              accessor: (item) => <span className="font-mono text-[#1E293B] font-semibold">{item.weeklyHours} hrs</span>,
            },
            {
              header: 'Priority',
              accessor: (item) => <Badge priority={item.priority} />,
            },
            {
              header: 'Status',
              accessor: (item) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {item.status}
                </span>
              ),
            },
          ]}
        />

        <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/hod/assignments')}
            className="text-[#0F766E] font-semibold hover:bg-teal-50"
          >
            View all assignments ({tasks.length}) →
          </Button>
        </div>
      </Card>

      {/* Faculty Detail Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full border border-[#E2E8F0] shadow-xl overflow-hidden">
            <div className="p-4 bg-[#1E2A55] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">{selectedFaculty.name}</h3>
                  <Badge status={selectedFaculty.status} />
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedFaculty.designation} • {selectedFaculty.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFaculty(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Workload Meter */}
              <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg space-y-2">
                <span className="text-xs font-bold text-[#1E293B] block">Workload Quota Status</span>
                <WorkloadProgressBar
                  currentHours={selectedFaculty.currentWorkloadHours}
                  maxHours={selectedFaculty.maxWorkloadHours}
                  status={selectedFaculty.status}
                />
              </div>

              {/* Specialization Skills */}
              <div>
                <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5 mb-2">
                  <Award className="w-4 h-4 text-[#0F766E]" />
                  Competency Skills & Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFaculty.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-[#1E293B] rounded-lg text-xs font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Tasks */}
              <div>
                <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5 mb-2">
                  <CheckSquare className="w-4 h-4 text-[#1E2A55]" />
                  Currently Assigned Academic Tasks
                </span>
                {getFacultyAssignedTasks(selectedFaculty.id).length === 0 ? (
                  <p className="text-xs text-[#64748B] italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                    No active tasks currently assigned to this faculty member.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getFacultyAssignedTasks(selectedFaculty.id).map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#1E293B]">{t.title}</p>
                          <p className="text-2xs text-[#64748B] font-mono">{t.type} • {t.courseCode || 'Department Task'}</p>
                        </div>
                        <span className="font-mono font-bold text-[#1E293B] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {t.weeklyHours} hrs/wk
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFaculty(null);
                  navigate('/hod/faculty');
                }}
              >
                Open Full Directory
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={() => {
                  setSelectedFaculty(null);
                  navigate('/hod/recommendations');
                }}
              >
                View Optimization Proposals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

