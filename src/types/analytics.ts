export interface WorkloadDistributionData {
  designation: string;
  avgHours: number;
  maxLimit: number;
  facultyCount: number;
}

export interface TaskTypeDistribution {
  type: string;
  hours: number;
  taskCount: number;
}

export interface DepartmentMetric {
  metric: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

export interface WeeklyTrend {
  week: string;
  totalWorkloadHours: number;
  overloadedCount: number;
  balancedCount: number;
  underloadedCount: number;
}
