package com.faculynk.service;

import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkloadService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final WorkloadCalculator workloadCalculator;

    public WorkloadService(FacultyProfileRepository facultyProfileRepository,
                           TaskAssignmentRepository taskAssignmentRepository,
                           WorkloadCalculator workloadCalculator) {
        this.facultyProfileRepository = facultyProfileRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.workloadCalculator = workloadCalculator;
    }

    @Transactional(readOnly = true)
    public WorkloadSummary calculateWorkload(String facultyId) {
        return calculateWorkload(facultyId, null);
    }

    @Transactional(readOnly = true)
    public WorkloadSummary calculateWorkload(String facultyId, Map<String, Integer> simulatedOffsets) {
        FacultyProfile profile = facultyProfileRepository.findById(facultyId)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found with ID: " + facultyId));

        int currentHours = taskAssignmentRepository.calculateCurrentWorkloadHours(facultyId);
        
        if (simulatedOffsets != null && simulatedOffsets.containsKey(facultyId)) {
            currentHours += simulatedOffsets.get(facultyId);
            // Ensure we don't go below 0 visually in simulation
            if (currentHours < 0) currentHours = 0;
        }

        int maxHours = profile.getMaxWorkloadHours();

        int utilization = workloadCalculator.calculateUtilization(currentHours, maxHours);
        int headroom = workloadCalculator.calculateHeadroom(currentHours, maxHours);
        int excess = workloadCalculator.calculateExcess(currentHours, maxHours);
        String status = workloadCalculator.calculateStatus(currentHours, maxHours);

        // Group active assignments by responsibility type and sum hours
        List<TaskAssignment> activeAssignments = taskAssignmentRepository.findByFacultyIdAndStatus(facultyId, AssignmentStatus.ACTIVE);
        Map<String, Integer> breakdown = new HashMap<>();
        for (TaskAssignment assignment : activeAssignments) {
            String typeName = assignment.getTask().getType().name();
            breakdown.put(typeName, breakdown.getOrDefault(typeName, 0) + assignment.getTask().getWeeklyHours());
        }

        return new WorkloadSummary(
                facultyId,
                currentHours,
                maxHours,
                utilization,
                headroom,
                excess,
                status,
                breakdown
        );
    }

    @Transactional(readOnly = true)
    public List<WorkloadSummary> getDepartmentWorkloadMatrix(String departmentId) {
        List<FacultyProfile> profiles = facultyProfileRepository.findByDepartmentId(departmentId);
        
        // Filter profiles where the associated user account is ACTIVE
        return profiles.stream()
                .filter(profile -> profile.getUser().getAccountStatus() == AccountStatus.ACTIVE)
                .map(profile -> calculateWorkload(profile.getId()))
                .collect(Collectors.toList());
    }
}
