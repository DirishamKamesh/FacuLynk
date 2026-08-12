import React from 'react';
import { WorkloadStatus } from '../../types/faculty';
import { Priority, TaskType } from '../../types/task';
import { getPriorityColors, getStatusBadgeColors, getTaskTypeBadge } from '../../utils/formatters';

interface BadgeProps {
  children?: React.ReactNode;
  status?: WorkloadStatus;
  priority?: Priority;
  taskType?: TaskType;
  variant?: 'default' | 'outline' | 'crimson' | 'emerald' | 'amber' | 'slate';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  priority,
  taskType,
  variant = 'default',
  className = '',
  dot = false,
}) => {
  if (status) {
    const colors = getStatusBadgeColors(status);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {status}
      </span>
    );
  }

  if (priority) {
    const colorClass = getPriorityColors(priority);
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} ${className}`}
      >
        {priority}
      </span>
    );
  }

  if (taskType) {
    const colorClass = getTaskTypeBadge(taskType);
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} ${className}`}
      >
        {taskType}
      </span>
    );
  }

  let baseStyle = 'bg-slate-100 text-slate-800 border-slate-200';
  if (variant === 'crimson') baseStyle = 'bg-rose-100 text-rose-900 border-rose-200';
  if (variant === 'emerald') baseStyle = 'bg-emerald-100 text-emerald-900 border-emerald-200';
  if (variant === 'amber') baseStyle = 'bg-amber-100 text-amber-900 border-amber-200';
  if (variant === 'slate') baseStyle = 'bg-slate-200 text-slate-800 border-slate-300';
  if (variant === 'outline') baseStyle = 'bg-transparent text-slate-700 border-slate-300';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${baseStyle} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
      {children}
    </span>
  );
};
