export type TaskType = 'Lecture' | 'Lab' | 'Admin' | 'Research' | 'Mentorship';
export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Unassigned' | 'Assigned' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  requiredSkills: string[];
  weeklyHours: number;
  priority: Priority;
  deadline: string;
  status: TaskStatus;
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  courseCode?: string;
  semester?: string;
  description?: string;
}
