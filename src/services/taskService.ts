import { Task } from '../types/task';
import { apiClient } from './apiClient';

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<any[]>('/tasks');
    return response.map(mapBackendToFrontendTask);
  },

  async getTaskById(id: string): Promise<Task | undefined> {
    try {
      const response = await apiClient.get<any>(`/tasks/${id}`);
      return mapBackendToFrontendTask(response);
    } catch (error) {
      return undefined;
    }
  },

  async addTask(newTask: Omit<Task, 'id'>): Promise<Task> {
    const response = await apiClient.post<any>('/tasks', {
      title: newTask.title,
      courseCode: newTask.courseCode,
      description: newTask.description,
      type: newTask.type,
      semester: newTask.semester,
      weeklyHours: newTask.weeklyHours,
      priority: newTask.priority,
      requiredSkills: newTask.requiredSkills,
    });
    return mapBackendToFrontendTask(response);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await apiClient.put<any>(`/tasks/${id}`, {
      title: updates.title,
      courseCode: updates.courseCode,
      description: updates.description,
      type: updates.type,
      semester: updates.semester,
      weeklyHours: updates.weeklyHours,
      priority: updates.priority,
      requiredSkills: updates.requiredSkills,
    });
    return mapBackendToFrontendTask(response);
  },

  async reassignTask(taskId: string, newFacultyId?: string, newFacultyName?: string): Promise<Task> {
    if (newFacultyId) {
      // Backend separates assign and reassign? Or both handled by one? Let's use assign/reassign.
      // Usually reassign works if it's already assigned. We'll use reassign endpoint.
      const response = await apiClient.post<any>(`/tasks/${taskId}/reassign`, {
        facultyId: newFacultyId
      });
      return mapBackendToFrontendTask(response);
    } else {
      // If unassigning, is there an endpoint? The backend assignment might not support unassign,
      // But typically we can just delete the assignment or pass null.
      // Assuming reassign with null works or we don't have unassign in this app's UI often.
      // For safety:
      const response = await apiClient.post<any>(`/tasks/${taskId}/reassign`, {
        facultyId: null
      });
      return mapBackendToFrontendTask(response);
    }
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};

function mapBackendToFrontendTask(dto: any): Task {
  return {
    id: dto.id,
    title: dto.title,
    courseCode: dto.code || '',
    description: dto.description || '',
    type: dto.type,
    semester: dto.semester,
    weeklyHours: dto.weeklyHours,
    priority: dto.priority,
    requiredSkills: dto.requiredSkills || [],
    assignedFacultyId: dto.assignedFacultyId || undefined,
    assignedFacultyName: dto.assignedFacultyName || undefined,
    status: dto.status === 'ACTIVE' ? 'Assigned' : (dto.assignedFacultyId ? 'Assigned' : 'Unassigned'),
    deadline: dto.deadline,
  };
}
