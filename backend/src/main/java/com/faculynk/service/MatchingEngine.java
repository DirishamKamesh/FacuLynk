package com.faculynk.service;

import com.faculynk.dto.CandidateResponse;
import com.faculynk.dto.ExcludedCandidateResponse;
import com.faculynk.dto.MatchingResponse;
import com.faculynk.dto.TaskResponse;
import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.TaskNotFoundException;
import com.faculynk.model.entity.FacultyInterest;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class MatchingEngine {

    private final TaskRepository taskRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final WorkloadService workloadService;

    public MatchingEngine(TaskRepository taskRepository,
                          FacultyProfileRepository facultyProfileRepository,
                          TaskAssignmentRepository taskAssignmentRepository,
                          WorkloadService workloadService) {
        this.taskRepository = taskRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.workloadService = workloadService;
    }

    public MatchingResponse calculateSuitability(String taskId, String sourceFacultyId) {
        return calculateSuitability(taskId, sourceFacultyId, null);
    }

    public MatchingResponse calculateSuitability(String taskId, String sourceFacultyId, java.util.Map<String, Integer> simulatedOffsets) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + taskId));

        List<FacultyProfile> allProfiles = facultyProfileRepository.findAll();

        List<CandidateResponse> candidates = new ArrayList<>();
        List<ExcludedCandidateResponse> excludedCandidates = new ArrayList<>();

        for (FacultyProfile profile : allProfiles) {
            String fId = profile.getId();
            String name = profile.getUser().getFullName();

            // 1. Hard constraint: Faculty active status
            if (profile.getUser().getAccountStatus() != AccountStatus.ACTIVE) {
                excludedCandidates.add(new ExcludedCandidateResponse(fId, name, "FACULTY_INACTIVE"));
                continue;
            }

            // 2. Hard constraint: Same department
            if (!profile.getDepartment().getId().equals(task.getDepartment().getId())) {
                excludedCandidates.add(new ExcludedCandidateResponse(fId, name, "WRONG_DEPARTMENT"));
                continue;
            }

            // 3. Hard constraint: Not source faculty
            if (sourceFacultyId != null && fId.equals(sourceFacultyId)) {
                excludedCandidates.add(new ExcludedCandidateResponse(fId, name, "SELF_CANDIDATE"));
                continue;
            }

            // Load live workload (with simulated offsets if any)
            WorkloadSummary workload = workloadService.calculateWorkload(fId, simulatedOffsets);
            int currentHours = workload.getCurrentHours();
            int maxHours = workload.getMaxHours();
            int headroom = workload.getHeadroomHours();
            int taskHours = task.getWeeklyHours();

            // 4. Hard constraint: Capacity verification
            if (currentHours + taskHours > maxHours) {
                excludedCandidates.add(new ExcludedCandidateResponse(fId, name, "INSUFFICIENT_CAPACITY"));
                continue;
            }

            // Calculate suitability scoring parameters
            // A. Skill overlap (45%)
            double skillScore = 0.0;
            List<String> matchedSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();

            Set<Skill> requiredSkills = task.getRequiredSkills();
            if (requiredSkills != null && !requiredSkills.isEmpty()) {
                Set<String> facultySkillNames = profile.getSkills().stream()
                        .map(Skill::getName)
                        .collect(Collectors.toSet());

                for (Skill reqSkill : requiredSkills) {
                    if (facultySkillNames.contains(reqSkill.getName())) {
                        matchedSkills.add(reqSkill.getName());
                    } else {
                        missingSkills.add(reqSkill.getName());
                    }
                }
                skillScore = ((double) matchedSkills.size() / requiredSkills.size()) * 100.0;
            }

            // B. Headroom Ratio (25%)
            double headroomRatio = (double) headroom / maxHours;
            double headroomScore = Math.min(1.0, headroomRatio) * 100.0;

            // C. Experience Score (15%)
            double experienceScore = (Math.min(profile.getExperienceYears(), 15) / 15.0) * 100.0;

            // D. Interest Alignment (15%)
            double interestScore = 0.0;
            if (profile.getInterests() != null) {
                for (FacultyInterest interest : profile.getInterests()) {
                    if (isInterestAligned(task.getType(), interest.getInterest())) {
                        interestScore = 100.0;
                        break;
                    }
                }
            }

            // Final Weighted Suitability
            double finalScore = (skillScore * 0.45)
                    + (headroomScore * 0.25)
                    + (experienceScore * 0.15)
                    + (interestScore * 0.15);

            finalScore = round(finalScore);

            candidates.add(new CandidateResponse(
                    fId,
                    name,
                    profile.getDesignation().getDisplayName(),
                    currentHours,
                    maxHours,
                    headroom,
                    currentHours + taskHours,
                    round(skillScore),
                    round(headroomScore),
                    round(experienceScore),
                    round(interestScore),
                    finalScore,
                    matchedSkills,
                    missingSkills,
                    "Eligible candidate",
                    true
            ));
        }

        // Sort candidates by tie-breaking: finalScore DESC, headroom DESC, workload ASC, facultyName ASC
        candidates.sort(
                Comparator.comparingDouble(CandidateResponse::getFinalScore).reversed()
                .thenComparing(CandidateResponse::getHeadroomHours, Comparator.reverseOrder())
                .thenComparing(CandidateResponse::getCurrentHours)
                .thenComparing(CandidateResponse::getFacultyName)
        );

        TaskResponse taskResp = mapTaskToResponse(task);

        return new MatchingResponse(taskResp, candidates, excludedCandidates);
    }

    private boolean isInterestAligned(ResponsibilityType taskType, String interest) {
        if (interest == null) return false;
        String normalizedInterest = interest.trim().toLowerCase();
        switch (taskType) {
            case TEACHING:
                return normalizedInterest.equals("teaching") || normalizedInterest.equals("lecture");
            case LABORATORY_SESSIONS:
                return normalizedInterest.equals("laboratory_sessions") || normalizedInterest.equals("laboratory sessions") || normalizedInterest.equals("lab");
            case PROJECT_GUIDANCE:
                return normalizedInterest.equals("project_guidance") || normalizedInterest.equals("project guidance") || normalizedInterest.equals("research");
            case EXAMINATIONS:
                return normalizedInterest.equals("examinations") || normalizedInterest.equals("examination");
            case MENTORING:
                return normalizedInterest.equals("mentoring") || normalizedInterest.equals("mentorship");
            case DEPARTMENTAL_ACTIVITIES:
                return normalizedInterest.equals("departmental_activities") || normalizedInterest.equals("departmental activities") || normalizedInterest.equals("admin");
            default:
                return false;
        }
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private TaskResponse mapTaskToResponse(Task task) {
        List<String> requiredSkills = task.getRequiredSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        String assignedFacultyId = null;
        String assignedFacultyName = null;

        Optional<TaskAssignment> activeAssignment = taskAssignmentRepository.findByTaskIdAndStatus(task.getId(), AssignmentStatus.ACTIVE);
        if (activeAssignment.isPresent()) {
            assignedFacultyId = activeAssignment.get().getFaculty().getId();
            assignedFacultyName = activeAssignment.get().getFaculty().getUser().getFullName();
        }

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
                assignedFacultyId,
                assignedFacultyName
        );
    }
}
