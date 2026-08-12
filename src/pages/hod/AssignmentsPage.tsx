import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AssignTaskDrawer } from '../../components/tasks/AssignTaskDrawer';
import { Task } from '../../types/task';
import { calculateSuitabilityScore } from '../../utils/workloadCalculator';
import { UserCheck } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { faculty, tasks } = useData();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Suitability Matrix & Task Allocation</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cross-evaluate faculty skill match scores against unassigned & assigned academic commitments
          </p>
        </div>
      </div>

      {/* Grid of Tasks with Top Suitable Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((t) => {
          // Calculate suitability score for all faculty
          const suitabilityScores = faculty
            .map((f) => ({
              faculty: f,
              score: calculateSuitabilityScore(f.skills, t.requiredSkills, f.currentWorkloadHours, f.maxWorkloadHours),
            }))
            .sort((a, b) => b.score - a.score);

          const topCandidate = suitabilityScores[0];

          return (
            <Card
              key={t.id}
              title={
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">{t.title}</h3>
                    <p className="text-2xs text-[#64748B] font-mono">
                      {t.courseCode ? `${t.courseCode} • ` : ''}
                      {t.weeklyHours} hrs/wk • {t.type}
                    </p>
                  </div>
                  <Badge priority={t.priority} />
                </div>
              }
              headerBorder={true}
            >
              <div className="space-y-3">
                {/* Current Assigned Status */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500">Current Assignment:</span>
                  <span className="font-bold text-[#1E293B]">
                    {t.assignedFacultyName || 'Unassigned (Backlog)'}
                  </span>
                </div>

                {/* Skills needed */}
                <div>
                  <span className="text-2xs font-semibold text-[#64748B] block mb-1">Required Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {t.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 bg-slate-100 text-[#1E293B] text-2xs font-medium rounded-lg border border-[#E2E8F0]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Matched Candidate Preview */}
                {topCandidate && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-2xs font-bold text-[#15803D] uppercase tracking-wider block">
                        Top Suitable Candidate
                      </span>
                      <p className="text-xs font-bold text-[#1E293B] mt-0.5">{topCandidate.faculty.name}</p>
                      <p className="text-2xs text-[#64748B]">
                        {topCandidate.faculty.currentWorkloadHours}/{topCandidate.faculty.maxWorkloadHours} hrs ({topCandidate.faculty.status})
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#15803D] text-white font-bold text-xs rounded-lg shadow-2xs">
                      {topCandidate.score}% Match
                    </span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant={t.assignedFacultyName ? 'outline' : 'teal'}
                    onClick={() => setSelectedTask(t)}
                    icon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    {t.assignedFacultyName ? 'Modify Assignment' : 'Assign to Suitable Faculty'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AssignTaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
};
