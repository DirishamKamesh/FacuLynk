import React from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { WorkloadProgressBar } from '../../components/common/WorkloadProgressBar';
import { Designation } from '../../types/faculty';
import { BarChart2, ShieldAlert, GraduationCap, CheckCircle } from 'lucide-react';

export const WorkloadPage: React.FC = () => {
  const { faculty, tasks } = useData();

  const designations: Designation[] = ['Professor', 'Associate Professor', 'Assistant Professor'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Workload Matrix & Designation Analysis</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Compare actual teaching, research, and admin commitments against statutory capacity limits
          </p>
        </div>
      </div>

      {/* Designation Groups */}
      <div className="space-y-6">
        {designations.map((desig) => {
          const groupFaculty = faculty.filter((f) => f.designation === desig);
          const maxLimit = desig === 'Professor' ? 10 : desig === 'Associate Professor' ? 16 : 20;

          const totalAssignedHours = groupFaculty.reduce((acc, f) => acc + f.currentWorkloadHours, 0);
          const totalMaxHours = groupFaculty.length * maxLimit;
          const groupUtilization = totalMaxHours > 0 ? Math.round((totalAssignedHours / totalMaxHours) * 100) : 0;

          return (
            <Card
              key={desig}
              title={
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#172554]" />
                  <span className="text-base font-bold text-[#1E293B]">{desig}s Group</span>
                  <span className="text-2xs sm:text-xs font-normal text-[#64748B] font-mono">
                    (Limit: {maxLimit} hrs/faculty)
                  </span>
                </div>
              }
              action={
                <div className="text-left sm:text-right font-mono text-xs mt-1 sm:mt-0">
                  <span className="text-slate-500">Group Utilization: </span>
                  <strong className="text-slate-900">{groupUtilization}%</strong>
                  <span className="text-slate-400 ml-1">({totalAssignedHours}/{totalMaxHours} hrs)</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupFaculty.map((f) => {
                  const facultyTasks = tasks.filter((t) => t.assignedFacultyId === f.id);

                  return (
                    <div key={f.id} className="p-4 bg-slate-50/80 border border-[#E2E8F0] rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1E2A55] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {f.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B] text-sm">{f.name}</p>
                            <p className="text-2xs text-[#64748B]">{f.email}</p>
                          </div>
                        </div>
                        <Badge status={f.status} />
                      </div>

                      {/* Workload Progress Bar */}
                      <WorkloadProgressBar
                        currentHours={f.currentWorkloadHours}
                        maxHours={f.maxWorkloadHours}
                        status={f.status}
                        size="md"
                      />

                      {/* Assigned Tasks Summary */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <p className="text-2xs font-bold text-[#64748B] mb-1.5">
                          Assigned Commitments ({facultyTasks.length})
                        </p>

                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {facultyTasks.length === 0 ? (
                            <p className="text-2xs text-slate-400 italic">No assigned tasks currently.</p>
                          ) : (
                            facultyTasks.map((t) => (
                              <div
                                key={t.id}
                                className="p-1.5 bg-white border border-slate-200 rounded text-2xs flex items-center justify-between"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-semibold text-slate-800 truncate">{t.title}</p>
                                  <p className="text-slate-400">{t.type}</p>
                                </div>
                                <span className="font-mono font-bold text-slate-900 shrink-0">
                                  {t.weeklyHours}h
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
