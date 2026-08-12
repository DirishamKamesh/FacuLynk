import { WorkloadShiftRecommendation } from '../types/recommendation';
import { apiClient } from './apiClient';

export const recommendationService = {
  async getRecommendations(): Promise<WorkloadShiftRecommendation[]> {
    const response = await apiClient.get<any[]>('/recommendations');
    return response.map(mapBackendToFrontendRecommendation);
  },

  async generateRecommendations(): Promise<WorkloadShiftRecommendation[]> {
    const response = await apiClient.post<any[]>('/recommendations/generate');
    return response.map(mapBackendToFrontendRecommendation);
  },

  async applyRecommendation(id: string): Promise<WorkloadShiftRecommendation> {
    const response = await apiClient.post<any>(`/recommendations/${id}/approve`);
    return mapBackendToFrontendRecommendation(response);
  },

  async rejectRecommendation(id: string): Promise<WorkloadShiftRecommendation> {
    const response = await apiClient.post<any>(`/recommendations/${id}/reject`);
    return mapBackendToFrontendRecommendation(response);
  },
};

function mapBackendToFrontendRecommendation(dto: any): WorkloadShiftRecommendation {
  return {
    id: dto.id,
    overloadedFacultyId: dto.sourceFacultyId,
    overloadedFacultyName: dto.sourceFacultyName || '',
    targetFacultyId: dto.targetFacultyId,
    targetFacultyName: dto.targetFacultyName || '',
    taskId: dto.taskId,
    taskTitle: dto.taskTitle || '',
    taskHours: dto.taskHours || 0,
    currentOverloadedHours: dto.currentOverloadedHours || 0,
    overloadedMaxLimit: dto.overloadedMaxLimit || 0,
    currentTargetHours: dto.currentTargetHours || 0,
    targetMaxLimit: dto.targetMaxLimit || 0,
    projectedOverloadedHours: dto.projectedOverloadedHours || 0,
    projectedTargetHours: dto.projectedTargetHours || 0,
    matchScore: dto.score || 0,
    status: dto.status === 'PENDING' ? 'Pending' : (dto.status === 'APPROVED' ? 'Applied' : (dto.status === 'REJECTED' ? 'Rejected' : dto.status === 'STALE' ? 'Stale' : 'Pending')),
    reason: dto.reason || '',
  };
}
