import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WorkloadProgressBar } from '../../components/common/WorkloadProgressBar';
import { Sliders, UserX, ArrowRight, CheckCircle2, ShieldAlert, Play } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const { faculty, runSimulation, reassignTask } = useData();

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [durationWeeks, setDurationWeeks] = useState<number>(4);
  const [hasSimulated, setHasSimulated] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  React.useEffect(() => {
    if (faculty.length > 0 && !selectedFacultyId) {
      setSelectedFacultyId(faculty[0].id);
    }
  }, [faculty, selectedFacultyId]);

  const handleRunSimulation = async () => {
    if (!selectedFacultyId) return;
    setIsSimulating(true);
    setHasSimulated(true);
    try {
      const result = await runSimulation(selectedFacultyId, durationWeeks);
      setSimulationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyRedistribution = async () => {
    if (!simulationResult) return;
    setIsApplying(true);
    try {
      for (const item of simulationResult.redistributionPlan) {
        if (item.suggestedFaculty) {
          await reassignTask(item.task.id, item.suggestedFaculty.id);
        }
      }
      alert('Simulated redistribution plan successfully applied to active department schedules!');
    } catch (err) {
      console.error('Error applying simulated plan:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Scenario Simulator & Leave Redistribution</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Model "what-if" scenarios (sabbatical, medical leave, unexpected departure) and calculate substitute coverage
          </p>
        </div>
      </div>

      {/* Scenario Controls Box */}
      <Card title="Configure What-If Scenario Parameters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Select Faculty Member Becoming Unavailable
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                setSelectedFacultyId(e.target.value);
                setHasSimulated(true);
              }}
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.designation} - {f.currentWorkloadHours} hrs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Unavailability Duration (Weeks)
            </label>
            <select
              value={durationWeeks}
              onChange={(e) => {
                setDurationWeeks(Number(e.target.value));
                setHasSimulated(true);
              }}
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value={2}>2 Weeks (Short Leave)</option>
              <option value={4}>4 Weeks (Medical Leave)</option>
              <option value={12}>12 Weeks (Sabbatical / Research Leave)</option>
              <option value={16}>16 Weeks (Full Semester)</option>
            </select>
          </div>

          <div>
            <Button
              variant="teal"
              className="w-full"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              icon={<Play className="w-4 h-4" />}
            >
              {isSimulating ? 'Simulating...' : 'Run Simulation Engine'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Box */}
          <div className="p-4 bg-[#172554] text-white rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0F766E] text-white rounded-lg shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Simulated Unavailability: {simulationResult.unavailableFaculty.name} ({simulationResult.durationWeeks} Weeks)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Affected Courses/Tasks: <strong>{simulationResult.affectedTasks.length} items</strong> ({simulationResult.unavailableFaculty.currentWorkloadHours} hrs/wk to redistribute)
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isApplying || simulationResult.affectedTasks.length === 0}
              onClick={handleApplyRedistribution}
              className="bg-white text-[#172554] hover:bg-slate-100 shrink-0 font-bold"
              icon={<CheckCircle2 className="w-4 h-4 text-[#15803D]" />}
            >
              {isApplying ? 'Applying Plan...' : 'Confirm & Apply Redistribution'}
            </Button>
          </div>

          {/* Redistribution Plan Details */}
          <Card
            title={`Substitute Redistribution Plan (${simulationResult.redistributionPlan.length} Tasks)`}
            subtitle="Automated skill matching and projected workload spikes"
          >
            {simulationResult.redistributionPlan.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                This faculty member has no active tasks assigned to redistribute.
              </p>
            ) : (
              <div className="space-y-4">
                {simulationResult.redistributionPlan.map(({ task, suggestedFaculty, suitabilityScore, projectedNewHours, projectedStatus }) => (
                  <div
                    key={task.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    {/* Task Info */}
                    <div className="md:col-span-4 space-y-1">
                      <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Affected Task</span>
                      <p className="font-bold text-slate-900 text-sm">{task.title}</p>
                      <p className="text-2xs text-slate-500 font-mono">
                        {task.courseCode || task.type} • {task.weeklyHours} hrs/wk
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.requiredSkills.map((sk) => (
                          <span key={sk} className="px-1.5 py-0.5 bg-white text-slate-700 text-2xs border rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hidden md:flex md:col-span-1 justify-center text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Suggested Substitute */}
                    <div className="md:col-span-7 space-y-2 bg-white p-3 border border-slate-200 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider">
                            Recommended Substitute ({suitabilityScore}% Skill Match)
                          </span>
                          <p className="font-bold text-slate-900 text-sm">{suggestedFaculty.name}</p>
                          <p className="text-2xs text-slate-500">{suggestedFaculty.designation}</p>
                        </div>
                        <Badge status={projectedStatus} />
                      </div>

                      <WorkloadProgressBar
                        currentHours={projectedNewHours}
                        maxHours={suggestedFaculty.maxWorkloadHours}
                        status={projectedStatus}
                        size="sm"
                      />

                      <div className="flex items-center justify-between text-2xs text-slate-500 font-mono">
                        <span>Current: {suggestedFaculty.currentWorkloadHours} hrs</span>
                        <span>
                          Simulated Spike: <strong className={projectedStatus === 'Overloaded' ? 'text-rose-700 font-bold' : 'text-slate-900'}>{projectedNewHours} hrs / {suggestedFaculty.maxWorkloadHours} limit</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
