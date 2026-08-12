package com.faculynk.service;

import com.faculynk.dto.CandidateResponse;
import com.faculynk.dto.MatchingResponse;
import com.faculynk.dto.SimulationResultResponse;
import com.faculynk.dto.SimulationResultResponse.SimulatedReassignment;
import com.faculynk.dto.SimulatorRequest;
import com.faculynk.dto.TaskResponse;
import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SimulatorService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final MatchingEngine matchingEngine;
    private final WorkloadService workloadService;

    public SimulatorService(FacultyProfileRepository facultyProfileRepository,
                            TaskAssignmentRepository taskAssignmentRepository,
                            MatchingEngine matchingEngine,
                            WorkloadService workloadService) {
        this.facultyProfileRepository = facultyProfileRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.matchingEngine = matchingEngine;
        this.workloadService = workloadService;
    }

    public SimulationResultResponse runSimulation(SimulatorRequest request) {
        String sourceFacultyId = request.getFacultyId();

        FacultyProfile sourceProfile = facultyProfileRepository.findById(sourceFacultyId)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found with ID: " + sourceFacultyId));

        List<TaskAssignment> activeAssignments = taskAssignmentRepository.findByFacultyIdAndStatus(sourceFacultyId, AssignmentStatus.ACTIVE);

        Map<String, Integer> simulatedOffsets = new HashMap<>();

        // Start by offsetting the source faculty's workload by completely removing their current active assignment hours
        int totalSourceHours = activeAssignments.stream().mapToInt(a -> a.getTask().getWeeklyHours()).sum();
        simulatedOffsets.put(sourceFacultyId, -totalSourceHours);

        List<SimulatedReassignment> reassignedTasks = new ArrayList<>();
        List<TaskResponse> unassignedTasks = new ArrayList<>();

        for (TaskAssignment assignment : activeAssignments) {
            Task task = assignment.getTask();
            int weeklyHours = task.getWeeklyHours();

            MatchingResponse match = matchingEngine.calculateSuitability(task.getId(), sourceFacultyId, simulatedOffsets);

            if (match.getCandidates() == null || match.getCandidates().isEmpty()) {
                unassignedTasks.add(mapToTaskResponse(task));
            } else {
                CandidateResponse bestCandidate = match.getCandidates().get(0);
                
                // Track simulated hours
                simulatedOffsets.put(bestCandidate.getFacultyId(), simulatedOffsets.getOrDefault(bestCandidate.getFacultyId(), 0) + weeklyHours);

                reassignedTasks.add(new SimulatedReassignment(mapToTaskResponse(task), bestCandidate, weeklyHours));
            }
        }

        List<WorkloadSummary> projectedWorkloads = new ArrayList<>();
        
        // Add the source faculty's projected workload
        projectedWorkloads.add(workloadService.calculateWorkload(sourceFacultyId, simulatedOffsets));

        // Add all destination faculties' projected workloads
        for (String targetFacultyId : simulatedOffsets.keySet()) {
            if (!targetFacultyId.equals(sourceFacultyId)) {
                projectedWorkloads.add(workloadService.calculateWorkload(targetFacultyId, simulatedOffsets));
            }
        }

        SimulationResultResponse response = new SimulationResultResponse();
        response.setSimulatedFacultyId(sourceFacultyId);
        response.setDurationWeeks(request.getDurationWeeks());
        response.setReassignedTasks(reassignedTasks);
        response.setUnassignedTasks(unassignedTasks);
        response.setProjectedWorkloads(projectedWorkloads);

        return response;
    }

    private TaskResponse mapToTaskResponse(Task task) {
        List<String> requiredSkills = task.getRequiredSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getCode(),
                task.getType().name(),
                task.getWeeklyHours(),
                task.getPriority().name(),
                task.getDepartment().getCode(),
                task.getSemester(),
                task.getDeadline(),
                task.getDescription(),
                requiredSkills,
                task.isActive(),
                null,
                null
        );
    }
}
