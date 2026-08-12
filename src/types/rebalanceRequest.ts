export type RebalanceRequestType = 'OVERLOAD_RELIEF' | 'PEER_REBALANCE_OFFER';
export type RebalanceRequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

export interface RebalanceRequest {
  id: string;
  requestType: RebalanceRequestType;
  requesterFacultyId: string;
  requesterFacultyName: string;
  requesterDesignation: string;
  
  targetOverloadedFacultyId: string;
  targetOverloadedFacultyName: string;
  
  suggestedAssigneeFacultyId?: string;
  suggestedAssigneeFacultyName?: string;
  
  taskId?: string;
  taskTitle?: string;
  taskHours?: number;
  
  reason: string;
  status: RebalanceRequestStatus;
  createdAt: string;
  hodNote?: string;
}
