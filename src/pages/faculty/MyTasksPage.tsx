import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Task } from '../../types/task';
import { CheckSquare, Clock, CheckCircle } from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const { activeFacultyId } = useAuth();
  const { faculty, tasks, updateTask } = useData();

  const myProfile = faculty.find((f) => f.id === activeFacultyId) || faculty[1];
  const myTasks = tasks.filter((t) => t.assignedFacultyId === myProfile?.id);

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
    await updateTask(taskId, { status: newStatus as any });
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0]">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">My Assigned Academic Tasks</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          View assigned course sections, laboratory supervision, and departmental commitments
        </p>
      </div>

      <Card title={`Assigned Tasks Roster (${myTasks.length})`}>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table<Task>
            data={myTasks}
            keyExtractor={(item) => item.id}
            columns={[
              {
                header: 'Task Title / Course',
                accessor: (item) => (
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-2xs text-slate-500 font-mono">{item.courseCode || item.type}</p>
                  </div>
                ),
              },
              {
                header: 'Category',
                accessor: (item) => <Badge taskType={item.type} />,
              },
              {
                header: 'Weekly Hours',
                accessor: (item) => <span className="font-mono font-semibold text-slate-900">{item.weeklyHours} hrs/wk</span>,
              },
              {
                header: 'Priority',
                accessor: (item) => <Badge priority={item.priority} />,
              },
              {
                header: 'Status',
                accessor: (item) => (
                  <Badge variant={item.status === 'Completed' ? 'emerald' : 'slate'}>
                    {item.status}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                accessor: (item) => (
                  <Button
                    size="sm"
                    variant={item.status === 'Completed' ? 'outline' : 'teal'}
                    onClick={() => handleToggleStatus(item.id, item.status)}
                  >
                    {item.status === 'Completed' ? 'Reopen Task' : 'Mark Completed'}
                  </Button>
                ),
              },
            ]}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-3">
          {myTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No assigned academic commitments found.</p>
          ) : (
            myTasks.map((item) => (
              <div key={item.id} className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-sm">{item.title}</h3>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5">{item.courseCode || item.type}</p>
                  </div>
                  <Badge priority={item.priority} />
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge taskType={item.type} />
                    <span className="font-mono font-bold text-slate-800">{item.weeklyHours} hrs/wk</span>
                  </div>
                  <Badge variant={item.status === 'Completed' ? 'emerald' : 'slate'}>
                    {item.status}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    size="sm"
                    variant={item.status === 'Completed' ? 'outline' : 'teal'}
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="w-full sm:w-auto justify-center"
                  >
                    {item.status === 'Completed' ? 'Reopen Task' : 'Mark Completed'}
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
