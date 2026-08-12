export type Designation = 'Professor' | 'Associate Professor' | 'Assistant Professor';
export type WorkloadStatus = 'Overloaded' | 'Balanced' | 'Underloaded';

export interface Faculty {
  id: string;
  name: string;
  email: string;
  designation: Designation;
  department: string;
  skills: string[];
  maxWorkloadHours: number; // Prof: 10, Assoc: 16, Asst: 20
  currentWorkloadHours: number;
  status: WorkloadStatus;
  avatarUrl?: string;
  phone?: string;
  office?: string;
  researchArea?: string;
  activeCoursesCount?: number;
}
