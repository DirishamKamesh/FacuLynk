import React, { useState } from 'react';
import { Task } from '../../types/task';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { WorkloadProgressBar } from '../common/WorkloadProgressBar';
import { calculateSuitabilityScore, calculateWorkloadStatus } from '../../utils/workloadCalculator';
import { X, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AssignTaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

export const AssignTaskDrawer: React.FC<AssignTaskDrawerProps> = ({ task, onClose }) => {
  const { faculty, reassignTask } = useData();
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  if (!task) return null;

  // Rank faculty by suitability score
  const rankedFaculty = faculty
    .map((f) => {
      const score = calculateSuitabilityScore(
        f.skills,
        task.requiredSkills,
        f.currentWorkloadHours,
        f.maxWorkloadHours
      );
      const isCurrentlyAssigned = f.id === task.assignedFacultyId;
      const projectedHours = isCurrentlyAssigned
        ? f.currentWorkloadHours
        : f.currentWorkloadHours + task.weeklyHours;
      const projectedStatus = calculateWorkloadStatus(projectedHours, f.maxWorkloadHours);

      return {
        faculty: f,
        score,
        isCurrentlyAssigned,
        projectedHours,
        projectedStatus,
      };
    })
    .sort((a, b) => b.score - a.score);

  const handleAssign = async (facId?: string) => {
    setIsAssigning(true);
    try {
      await reassignTask(task.id, facId);
      onClose();
    } catch (err) {
      console.error('Error reassigning task:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest">
              Task Assignment & Suitability
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{task.title}</h3>
            <p className="text-xs text-slate-500 font-mono">
              {task.courseCode ? `${task.courseCode} • ` : ''}
              {task.weeklyHours} hrs/wk • {task.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Required Skills & Current Assignment */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-200 space-y-3">
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">Required Skills:</span>
            <div className="flex flex-wrap gap-1.5">
              {task.requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2 py-0.5 bg-slate-100 text-slate-800 text-2xs font-semibold rounded border border-slate-200"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
            <span className="text-slate-500">Current Assignment:</span>
            <span className="font-bold text-slate-900">
              {task.assignedFacultyName || 'Unassigned (Backlog)'}
            </span>
          </div>
        </div>

        {/* Ranked Faculty Candidates */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Faculty Suitability Ranking
            </h4>
            <span className="text-2xs text-slate-400">Skill match + Available quota</span>
          </div>

          {rankedFaculty.map(({ faculty: f, score, isCurrentlyAssigned, projectedHours, projectedStatus }) => (
            <div
              key={f.id}
              className={`p-4 rounded-lg border transition-all ${
                isCurrentlyAssigned
                  ? 'border-indigo-300 bg-indigo-50/40 ring-1 ring-indigo-300'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={f.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={f.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {f.name}
                      {isCurrentlyAssigned && (
                        <span className="text-2xs font-semibold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded border border-indigo-200">
                          Assigned
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{f.designation}</p>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      score >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : score >= 60
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {score}% Match
                  </span>
                </div>
              </div>

              {/* Workload Progress Bar & Projected Impact */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <WorkloadProgressBar
                  currentHours={projectedHours}
                  maxHours={f.maxWorkloadHours}
                  status={projectedStatus}
                  size="sm"
                />

                <div className="flex items-center justify-between text-2xs text-slate-500 mt-1.5 font-mono">
                  <span>Current: {f.currentWorkloadHours} hrs</span>
                  <span>
                    Projected: <strong>{projectedHours} hrs</strong> ({projectedStatus})
                  </span>
                </div>

                <div className="mt-3 flex justify-end">
                  {!isCurrentlyAssigned ? (
                    <Button
                      size="sm"
                      variant={projectedStatus === 'Overloaded' ? 'outline' : 'primary'}
                      disabled={isAssigning}
                      onClick={() => handleAssign(f.id)}
                    >
                      {projectedStatus === 'Overloaded' ? 'Assign (Causes Overload)' : 'Assign Task'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isAssigning}
                      onClick={() => handleAssign(undefined)}
                    >
                      Unassign Task
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
