package com.faculynk.dto;

import java.util.List;

public class SimulationResultResponse {
    private String simulatedFacultyId;
    private int durationWeeks;
    private List<SimulatedReassignment> reassignedTasks;
    private List<TaskResponse> unassignedTasks;
    private List<WorkloadSummary> projectedWorkloads;

    public SimulationResultResponse() {}

    public String getSimulatedFacultyId() {
        return simulatedFacultyId;
    }

    public void setSimulatedFacultyId(String simulatedFacultyId) {
        this.simulatedFacultyId = simulatedFacultyId;
    }

    public int getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(int durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public List<SimulatedReassignment> getReassignedTasks() {
        return reassignedTasks;
    }

    public void setReassignedTasks(List<SimulatedReassignment> reassignedTasks) {
        this.reassignedTasks = reassignedTasks;
    }

    public List<TaskResponse> getUnassignedTasks() {
        return unassignedTasks;
    }

    public void setUnassignedTasks(List<TaskResponse> unassignedTasks) {
        this.unassignedTasks = unassignedTasks;
    }

    public List<WorkloadSummary> getProjectedWorkloads() {
        return projectedWorkloads;
    }

    public void setProjectedWorkloads(List<WorkloadSummary> projectedWorkloads) {
        this.projectedWorkloads = projectedWorkloads;
    }

    public static class SimulatedReassignment {
        private TaskResponse task;
        private CandidateResponse targetFaculty;
        private int originalWeeklyHours;

        public SimulatedReassignment() {}

        public SimulatedReassignment(TaskResponse task, CandidateResponse targetFaculty, int originalWeeklyHours) {
            this.task = task;
            this.targetFaculty = targetFaculty;
            this.originalWeeklyHours = originalWeeklyHours;
        }

        public TaskResponse getTask() {
            return task;
        }

        public void setTask(TaskResponse task) {
            this.task = task;
        }

        public CandidateResponse getTargetFaculty() {
            return targetFaculty;
        }

        public void setTargetFaculty(CandidateResponse targetFaculty) {
            this.targetFaculty = targetFaculty;
        }

        public int getOriginalWeeklyHours() {
            return originalWeeklyHours;
        }

        public void setOriginalWeeklyHours(int originalWeeklyHours) {
            this.originalWeeklyHours = originalWeeklyHours;
        }
    }
}
