import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WorkloadProgressBar } from '../../components/common/WorkloadProgressBar';
import { RebalanceRequestModal } from '../../components/faculty/RebalanceRequestModal';
import { calculateWorkloadStatus } from '../../utils/workloadCalculator';
import { CheckSquare, Calendar, Gauge, BookOpen, Clock, ArrowRight, User, Scale } from 'lucide-react';

export const MyDashboardPage: React.FC = () => {
  const { activeFacultyId } = useAuth();
  const { faculty, tasks, updateTask } = useData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const myProfile = faculty.find((f) => f.id === activeFacultyId) || faculty[1]; // Fallback to Dr. Jim Cokely
  const myTasks = tasks.filter((t) => t.assignedFacultyId === myProfile?.id);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
    await updateTask(taskId, { status: newStatus as any });
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Greeting */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <img
            src={myProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={myProfile?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{myProfile?.name}</h1>
              <Badge status={myProfile?.status || 'Balanced'} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {myProfile?.designation} • {myProfile?.department}
            </p>
            <p className="text-2xs text-slate-400 mt-0.5 font-mono">Office: {myProfile?.office || 'Engineering Hall'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="teal"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Scale className="w-4 h-4" />}
            className="justify-center"
          >
            Request Rebalance to HOD
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/faculty/schedule')} icon={<Calendar className="w-4 h-4" />} className="justify-center">
            View Timetable
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/faculty/profile')} icon={<User className="w-4 h-4" />} className="justify-center">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Modal */}
      <RebalanceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Capacity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Gauge */}
        <Card title="My Workload Capacity Gauge" subtitle="Designation quota compliance" className="md:col-span-2">
          <div className="space-y-4">
            <WorkloadProgressBar
              currentHours={myProfile?.currentWorkloadHours || 0}
              maxHours={myProfile?.maxWorkloadHours || 16}
              status={myProfile?.status || 'Balanced'}
              size="lg"
            />

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-center font-mono">
              <div className="p-2 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-2xs text-slate-400 block uppercase">Assigned Workload</span>
                <strong className="text-base text-slate-900">{myProfile?.currentWorkloadHours} hrs/wk</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-2xs text-slate-400 block uppercase">Designation Limit</span>
                <strong className="text-base text-slate-900">{myProfile?.maxWorkloadHours} hrs/wk</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-2xs text-slate-400 block uppercase">Available Headroom</span>
                <strong className="text-base text-emerald-700">
                  {Math.max(0, (myProfile?.maxWorkloadHours || 16) - (myProfile?.currentWorkloadHours || 0))} hrs
                </strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Summary */}
        <Card title="My Commitments Summary" subtitle="Semester workload distribution">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-600 font-medium">Assigned Tasks Count</span>
              <strong className="text-slate-900 font-mono text-sm">{myTasks.length} Courses/Tasks</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-600 font-medium">Active Courses</span>
              <strong className="text-slate-900 font-mono text-sm">{myProfile?.activeCoursesCount || 2} Sections</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-600 font-medium">Research & Specialization</span>
              <span className="text-slate-900 font-semibold truncate max-w-[120px] text-right">
                {myProfile?.researchArea || 'Computer Science'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Assigned Tasks Roster */}
      <Card
        title="My Assigned Academic Tasks & Courses"
        subtitle="Current semester teaching sections, lab supervisions, and committee responsibilities"
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/faculty/tasks')}>
            Manage All
          </Button>
        }
      >
        <div className="space-y-3">
          {myTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No assigned tasks found for this profile.</p>
          ) : (
            myTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                    <Badge taskType={t.type} />
                  </div>
                  <p className="text-2xs text-slate-500 font-mono">
                    {t.courseCode ? `${t.courseCode} • ` : ''}
                    {t.weeklyHours} hrs/wk • Due: {t.deadline}
                  </p>
                  {t.description && <p className="text-xs text-slate-600 mt-1">{t.description}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-900">{t.weeklyHours} hrs</span>
                  <Button
                    size="sm"
                    variant={t.status === 'Completed' ? 'outline' : 'primary'}
                    onClick={() => handleToggleTaskStatus(t.id, t.status)}
                  >
                    {t.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
