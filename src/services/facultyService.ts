import { Faculty, WorkloadStatus, Designation } from '../types/faculty';
import { apiClient } from './apiClient';

export const facultyService = {
  async getFaculty(): Promise<Faculty[]> {
    const response = await apiClient.get<any[]>('/faculty');
    return response.map(mapBackendToFrontendFaculty);
  },

  async getFacultyById(id: string): Promise<Faculty | undefined> {
    try {
      const response = await apiClient.get<any>(`/faculty/${id}`);
      return mapBackendToFrontendFaculty(response);
    } catch (error) {
      return undefined;
    }
  },

  async addFaculty(newFaculty: Omit<Faculty, 'id' | 'status'>): Promise<Faculty> {
    const response = await apiClient.post<any>('/faculty', {
      institutionalId: `FAC-${Date.now().toString().slice(-4)}`, // Or pass real id
      email: newFaculty.email,
      fullName: newFaculty.name,
      designation: newFaculty.designation,
      departmentCode: 'CS',
    });
    return mapBackendToFrontendFaculty(response);
  },

  async updateFaculty(id: string, updates: Partial<Faculty>): Promise<Faculty> {
    const response = await apiClient.put<any>(`/faculty/${id}`, {
      phone: updates.phone,
      office: updates.office,
      researchArea: updates.researchArea,
      skills: updates.skills,
    });
    return mapBackendToFrontendFaculty(response);
  },

  async selfUpdateProfile(updates: Partial<Faculty>): Promise<Faculty> {
    const response = await apiClient.put<any>('/faculty/me/profile', {
      phone: updates.phone,
      office: updates.office,
      researchArea: updates.researchArea,
      skills: updates.skills,
    });
    return mapBackendToFrontendFaculty(response);
  },

  async deleteFaculty(id: string): Promise<void> {
    await apiClient.delete(`/faculty/${id}`);
  },
};

function mapBackendToFrontendFaculty(dto: any): Faculty {
  let mappedStatus: WorkloadStatus = 'Underloaded';
  if (dto.status === 'OVERLOADED') mappedStatus = 'Overloaded';
  if (dto.status === 'BALANCED' || dto.status === 'OPTIMAL') mappedStatus = 'Balanced';

  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    designation: dto.designation as Designation,
    department: dto.department || 'Computer Science',
    skills: dto.skills || [],
    maxWorkloadHours: dto.maxWorkloadHours || 0,
    currentWorkloadHours: dto.currentWorkloadHours || 0,
    status: mappedStatus,
    phone: '', // Needs to be fetched if backend provides it in FacultyResponse, otherwise empty
    office: '',
    researchArea: '',
    activeCoursesCount: 0,
  };
}
