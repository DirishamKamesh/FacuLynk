export interface WorkloadShiftRecommendation {
  id: string;
  overloadedFacultyId: string;
  overloadedFacultyName: string;
  targetFacultyId: string;
  targetFacultyName: string;
  taskId: string;
  taskTitle: string;
  taskHours: number;
  currentOverloadedHours: number; // e.g. 14
  overloadedMaxLimit: number;     // e.g. 10
  currentTargetHours: number;    // e.g. 12
  targetMaxLimit: number;        // e.g. 16
  projectedOverloadedHours: number; // 11
  projectedTargetHours: number;    // 15
  reason: string;
  status: 'Pending' | 'Applied' | 'Rejected' | 'Stale';
  matchScore?: number;
}
