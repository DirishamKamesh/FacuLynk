import { RebalanceRequest } from '../types/rebalanceRequest';
import { delay } from './api';

export const initialMockRebalanceRequests: RebalanceRequest[] = [
  {
    id: 'req-501',
    requestType: 'OVERLOAD_RELIEF',
    requesterFacultyId: 'fac-101',
    requesterFacultyName: 'Dr. Sarah Vance',
    requesterDesignation: 'Professor',
    targetOverloadedFacultyId: 'fac-101',
    targetOverloadedFacultyName: 'Dr. Sarah Vance',
    suggestedAssigneeFacultyId: 'fac-103',
    suggestedAssigneeFacultyName: 'Dr. Aris Thorne',
    taskId: 'tsk-201',
    taskTitle: 'CS 4013 Database Systems Lab',
    taskHours: 3,
    reason: 'I am currently overloaded at 14/10 hrs (+4h over limit). Requesting to reassign Database Systems Lab to Dr. Aris Thorne who has 8 hrs available capacity.',
    status: 'PENDING',
    createdAt: '2026-08-10T09:30:00Z',
  },
  {
    id: 'req-502',
    requestType: 'PEER_REBALANCE_OFFER',
    requesterFacultyId: 'fac-103',
    requesterFacultyName: 'Dr. Aris Thorne',
    requesterDesignation: 'Assistant Professor',
    targetOverloadedFacultyId: 'fac-105',
    targetOverloadedFacultyName: 'Dr. Sherry Holmes',
    suggestedAssigneeFacultyId: 'fac-103',
    suggestedAssigneeFacultyName: 'Dr. Aris Thorne',
    taskId: 'tsk-207',
    taskTitle: 'Biostatistics Graduate Seminar',
    taskHours: 4,
    reason: 'I have 8 hrs available capacity (12/20 hrs). Offering to take over Biostatistics Seminar from Dr. Sherry Holmes (18/16 hrs) to balance departmental load.',
    status: 'PENDING',
    createdAt: '2026-08-11T08:15:00Z',
  },
];

let requestsStore: RebalanceRequest[] = [...initialMockRebalanceRequests];

export const rebalanceRequestService = {
  async getRebalanceRequests(): Promise<RebalanceRequest[]> {
    await delay();
    return [...requestsStore];
  },

  async createRebalanceRequest(
    requestData: Omit<RebalanceRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<RebalanceRequest> {
    await delay();
    const newReq: RebalanceRequest = {
      ...requestData,
      id: `req-${Date.now().toString().slice(-4)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    requestsStore = [newReq, ...requestsStore];
    return newReq;
  },

  async approveRebalanceRequest(id: string, hodNote?: string): Promise<RebalanceRequest> {
    await delay();
    const idx = requestsStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Request ${id} not found`);
    const updated: RebalanceRequest = {
      ...requestsStore[idx],
      status: 'APPROVED',
      hodNote,
    };
    requestsStore[idx] = updated;
    return updated;
  },

  async declineRebalanceRequest(id: string, hodNote?: string): Promise<RebalanceRequest> {
    await delay();
    const idx = requestsStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Request ${id} not found`);
    const updated: RebalanceRequest = {
      ...requestsStore[idx],
      status: 'DECLINED',
      hodNote,
    };
    requestsStore[idx] = updated;
    return updated;
  },
};
