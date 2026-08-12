import { WorkloadStatus } from '../types/faculty';
import { Priority, TaskType } from '../types/task';

export function formatHours(hours: number): string {
  return `${hours} hrs/wk`;
}

export function getStatusBadgeColors(status: WorkloadStatus) {
  switch (status) {
    case 'Overloaded':
      return {
        bg: 'bg-red-50',
        text: 'text-[#B91C1C]',
        border: 'border-red-200',
        dot: 'bg-[#B91C1C]',
        bar: 'bg-[#B91C1C]',
      };
    case 'Balanced':
      return {
        bg: 'bg-emerald-50',
        text: 'text-[#15803D]',
        border: 'border-emerald-200',
        dot: 'bg-[#15803D]',
        bar: 'bg-[#15803D]',
      };
    case 'Underloaded':
      return {
        bg: 'bg-amber-50',
        text: 'text-[#B45309]',
        border: 'border-amber-200',
        dot: 'bg-[#B45309]',
        bar: 'bg-[#B45309]',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        bar: 'bg-slate-400',
      };
  }
}

export function getPriorityColors(priority: Priority) {
  switch (priority) {
    case 'High':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Medium':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Low':
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getTaskTypeBadge(type: TaskType) {
  switch (type) {
    case 'Lecture':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Lab':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Admin':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Research':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Mentorship':
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}
