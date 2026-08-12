import React from 'react';
import { WorkloadStatus } from '../../types/faculty';
import { getStatusBadgeColors } from '../../utils/formatters';
import {
  calculateAvailableHours,
  calculateExcessHours,
  calculateUtilization,
  calculateWorkloadStatus,
} from '../../utils/workloadCalculator';

interface WorkloadProgressBarProps {
  currentHours: number;
  maxHours: number;
  status?: WorkloadStatus;
  showLabels?: boolean;
  showSubtext?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WorkloadProgressBar: React.FC<WorkloadProgressBarProps> = ({
  currentHours,
  maxHours,
  status,
  showLabels = true,
  showSubtext = true,
  size = 'md',
  className = '',
}) => {
  const utilization = calculateUtilization(currentHours, maxHours);
  const calculatedStatus = status || calculateWorkloadStatus(currentHours, maxHours);
  const colors = getStatusBadgeColors(calculatedStatus);

  const excess = calculateExcessHours(currentHours, maxHours);
  const available = calculateAvailableHours(currentHours, maxHours);

  // Normalizing container track scale to 140% so 100% limit line is visible and overflow extends past it
  const maxScale = Math.max(140, utilization);
  const limitLinePosition = (100 / maxScale) * 100;
  const barWidth = Math.min(100, (utilization / maxScale) * 100);

  const heightClasses = {
    sm: 'h-2.5',
    md: 'h-3',
    lg: 'h-4',
  };

  const getSubtext = () => {
    if (calculatedStatus === 'Overloaded') {
      return `+${excess} hrs over limit`;
    }
    return `${available} hrs available`;
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs mb-1 font-sans">
          <span className="text-[#1E293B] font-semibold font-mono">
            {currentHours} / {maxHours} hrs
          </span>
          <span className={`font-bold ${colors.text}`}>{utilization}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E2E8F0] rounded-full relative border border-slate-200/80 overflow-hidden ${heightClasses[size]}`}>
        {/* 100% Quota Limit Line Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-70"
          style={{ left: `${limitLinePosition}%` }}
          title={`Quota Limit (${maxHours} hrs)`}
        />

        {/* Progress Bar */}
        <div
          className={`h-full transition-all duration-300 ${colors.bar} rounded-l-full ${
            utilization >= maxScale ? 'rounded-r-full' : ''
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {showSubtext && (
        <div className="flex items-center justify-between mt-1 text-2xs">
          <span className={`font-bold ${colors.text}`}>{calculatedStatus}</span>
          <span className="text-[#64748B] font-medium font-mono">{getSubtext()}</span>
        </div>
      )}
    </div>
  );
};


