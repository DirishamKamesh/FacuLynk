import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Table } from '../../components/common/Table';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { AssignTaskDrawer } from '../../components/tasks/AssignTaskDrawer';
import { Priority, Task, TaskType } from '../../types/task';
import { Plus, UserCheck, Edit2, Trash2, BookOpen, Clock } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const [drawerTask, setDrawerTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.courseCode && t.courseCode.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignedFacultyName && t.assignedFacultyName.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this academic task?')) {
      await deleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Task & Course Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lectures, lab supervision, committee admin duties, and research mentorship allocation
          </p>
        </div>

        <Button variant="teal" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Create Academic Task
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:w-1/3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search tasks, course code, or faculty..." />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter Type */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800"
              >
                <option value="ALL">All Categories</option>
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Admin">Admin</option>
                <option value="Research">Research</option>
                <option value="Mentorship">Mentorship</option>
              </select>
            </div>

            {/* Filter Priority */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800"
              >
                <option value="ALL">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Assignment:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="Unassigned">Unassigned (Backlog)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Table (Desktop) & Mobile Task Cards */}
      <Card title={`Academic Tasks Roster (${filteredTasks.length})`}>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table<Task>
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            columns={[
              {
                header: 'Task Title & Course',
                accessor: (item) => (
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-2xs text-slate-500 font-mono">{item.courseCode || 'General Commitment'}</p>
                  </div>
                ),
              },
              {
                header: 'Category',
                accessor: (item) => <Badge taskType={item.type} />,
              },
              {
                header: 'Workload',
                accessor: (item) => <span className="font-mono font-semibold text-slate-900">{item.weeklyHours} hrs/wk</span>,
              },
              {
                header: 'Priority',
                accessor: (item) => <Badge priority={item.priority} />,
              },
              {
                header: 'Assigned Faculty',
                accessor: (item) => (
                  <div>
                    {item.assignedFacultyName ? (
                      <span className="font-semibold text-slate-800 text-xs">{item.assignedFacultyName}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
                        Unassigned
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Assign & Rebalance',
                accessor: (item) => (
                  <Button
                    size="sm"
                    variant={item.assignedFacultyName ? 'outline' : 'teal'}
                    onClick={() => setDrawerTask(item)}
                    icon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    {item.assignedFacultyName ? 'Reassign' : 'Find Best Faculty'}
                  </Button>
                ),
              },
              {
                header: 'Actions',
                accessor: (item) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Mobile Task Cards View */}
        <div className="block md:hidden space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No academic tasks found matching criteria.</p>
          ) : (
            filteredTasks.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-sm leading-snug">{item.title}</h3>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5">{item.courseCode || 'General Commitment'}</p>
                  </div>
                  <Badge priority={item.priority} />
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge taskType={item.type} />
                    <span className="font-mono font-bold text-slate-800">{item.weeklyHours} hrs/wk</span>
                  </div>
                  <div>
                    {item.assignedFacultyName ? (
                      <span className="font-semibold text-slate-800 text-2xs bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                        {item.assignedFacultyName}
                      </span>
                    ) : (
                      <span className="font-semibold text-rose-800 text-2xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(item.id)}
                      className="p-2 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant={item.assignedFacultyName ? 'outline' : 'teal'}
                    onClick={() => setDrawerTask(item)}
                    icon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    {item.assignedFacultyName ? 'Reassign' : 'Find Best Faculty'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
      />

      <AssignTaskDrawer task={drawerTask} onClose={() => setDrawerTask(null)} />
    </div>
  );
};
