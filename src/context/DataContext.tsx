import React, { createContext, useContext, useEffect, useState } from 'react';
import { facultyService } from '../services/facultyService';
import { recommendationService } from '../services/recommendationService';
import { rebalanceRequestService } from '../services/rebalanceRequestService';
import { taskService } from '../services/taskService';
import { Faculty } from '../types/faculty';
import { WorkloadShiftRecommendation } from '../types/recommendation';
import { RebalanceRequest } from '../types/rebalanceRequest';
import { Task } from '../types/task';
import { apiClient } from '../services/apiClient';

export interface SimulationResult {
  unavailableFaculty: Faculty;
  durationWeeks: number;
  affectedTasks: Task[];
  redistributionPlan: Array<{
    task: Task;
    suggestedFaculty: Faculty;
    suitabilityScore: number;
    projectedNewHours: number;
    projectedStatus: Faculty['status'];
  }>;
}

interface DataContextType {
  faculty: Faculty[];
  tasks: Task[];
  recommendations: WorkloadShiftRecommendation[];
  rebalanceRequests: RebalanceRequest[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addFaculty: (faculty: Omit<Faculty, 'id' | 'status'>) => Promise<void>;
  updateFaculty: (id: string, updates: Partial<Faculty>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  reassignTask: (taskId: string, facultyId?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  applyRecommendation: (id: string) => Promise<void>;
  rejectRecommendation: (id: string) => Promise<void>;
  createRebalanceRequest: (request: Omit<RebalanceRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  approveRebalanceRequest: (id: string, hodNote?: string) => Promise<void>;
  declineRebalanceRequest: (id: string, hodNote?: string) => Promise<void>;
  runSimulation: (facultyId: string, durationWeeks: number) => Promise<SimulationResult | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendations, setRecommendations] = useState<WorkloadShiftRecommendation[]>([]);
  const [rebalanceRequests, setRebalanceRequests] = useState<RebalanceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [facData, tskData, recData, reqData] = await Promise.all([
        facultyService.getFaculty(),
        taskService.getTasks(),
        recommendationService.getRecommendations(),
        rebalanceRequestService.getRebalanceRequests(),
      ]);
      setFaculty(facData);
      setTasks(tskData);
      setRecommendations(recData);
      setRebalanceRequests(reqData);
    } catch (error) {
      console.error('Failed to load initial institutional data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const addFaculty = async (newFac: Omit<Faculty, 'id' | 'status'>) => {
    await facultyService.addFaculty(newFac);
    await fetchAllData();
  };

  const updateFaculty = async (id: string, updates: Partial<Faculty>) => {
    await facultyService.updateFaculty(id, updates);
    await fetchAllData();
  };

  const deleteFaculty = async (id: string) => {
    await facultyService.deleteFaculty(id);
    await fetchAllData();
  };

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    await taskService.addTask(newTask);
    await fetchAllData();
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await taskService.updateTask(id, updates);
    await fetchAllData();
  };

  const reassignTask = async (taskId: string, targetFacultyId?: string) => {
    await taskService.reassignTask(taskId, targetFacultyId);
    await fetchAllData();
  };

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id);
    await fetchAllData();
  };

  const applyRecommendation = async (recId: string) => {
    await recommendationService.applyRecommendation(recId);
    await fetchAllData();
  };

  const rejectRecommendation = async (recId: string) => {
    await recommendationService.rejectRecommendation(recId);
    await fetchAllData();
  };

  const createRebalanceRequest = async (
    reqData: Omit<RebalanceRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    await rebalanceRequestService.createRebalanceRequest(reqData);
    await fetchAllData();
  };

  const approveRebalanceRequest = async (id: string, hodNote?: string) => {
    await rebalanceRequestService.approveRebalanceRequest(id, hodNote);
    await fetchAllData();
  };

  const declineRebalanceRequest = async (id: string, hodNote?: string) => {
    await rebalanceRequestService.declineRebalanceRequest(id, hodNote);
    await fetchAllData();
  };

  const runSimulation = async (facultyId: string, durationWeeks: number): Promise<SimulationResult | null> => {
    try {
      const response = await apiClient.post<any>('/simulator/run', {
        facultyId,
        durationWeeks,
      });

      // Map backend SimulationResultResponse to frontend SimulationResult
      return {
        unavailableFaculty: {
          id: response.unavailableFacultyId,
          name: response.unavailableFacultyName,
          email: '',
          designation: 'Professor',
          department: '',
          skills: [],
          maxWorkloadHours: response.maxWorkloadHours || 0,
          currentWorkloadHours: response.currentWorkloadHours || 0,
          status: 'Underloaded',
        },
        durationWeeks: response.durationWeeks,
        affectedTasks: (response.affectedTasks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          code: t.code,
          description: t.description,
          type: t.type,
          semester: t.semester,
          weeklyHours: t.weeklyHours,
          priority: t.priority,
          requiredSkills: t.requiredSkills,
          assignedFacultyId: t.assignedFacultyId,
          status: 'Unassigned',
        })),
        redistributionPlan: (response.redistributionPlan || []).map((rp: any) => ({
          task: {
            id: rp.task.id,
            title: rp.task.title,
            code: rp.task.code,
            description: rp.task.description,
            type: rp.task.type,
            semester: rp.task.semester,
            weeklyHours: rp.task.weeklyHours,
            priority: rp.task.priority,
            requiredSkills: rp.task.requiredSkills,
            assignedFacultyId: rp.task.assignedFacultyId,
            status: 'Unassigned',
          },
          suggestedFaculty: {
            id: rp.suggestedFacultyId,
            name: rp.suggestedFacultyName,
            email: '',
            designation: 'Professor',
            department: '',
            skills: [],
            maxWorkloadHours: 0,
            currentWorkloadHours: 0,
            status: 'Underloaded',
          },
          suitabilityScore: rp.suitabilityScore,
          projectedNewHours: rp.projectedNewHours,
          projectedStatus: rp.projectedStatus === 'OVERLOADED' ? 'Overloaded' : (rp.projectedStatus === 'UNDERUTILIZED' ? 'Underloaded' : 'Balanced'),
        })),
      };
    } catch (e) {
      console.error('Failed to run simulation', e);
      return null;
    }
  };

  return (
    <DataContext.Provider
      value={{
        faculty,
        tasks,
        recommendations,
        rebalanceRequests,
        loading,
        refreshData: fetchAllData,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        addTask,
        updateTask,
        reassignTask,
        deleteTask,
        applyRecommendation,
        rejectRecommendation,
        createRebalanceRequest,
        approveRebalanceRequest,
        declineRebalanceRequest,
        runSimulation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
