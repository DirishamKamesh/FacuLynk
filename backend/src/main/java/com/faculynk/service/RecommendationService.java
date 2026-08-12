package com.faculynk.service;

import com.faculynk.dto.CandidateResponse;
import com.faculynk.dto.MatchingResponse;
import com.faculynk.dto.RecommendationItemResponse;
import com.faculynk.dto.RecommendationResponse;
import com.faculynk.dto.TaskResponse;
import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.exception.StaleRecommendationException;
import com.faculynk.service.AuditService;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Recommendation;
import com.faculynk.model.entity.RecommendationItem;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.RecommendationStatus;
import com.faculynk.repository.AuditLogRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.RecommendationItemRepository;
import com.faculynk.repository.RecommendationRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final RecommendationItemRepository recommendationItemRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final MatchingEngine matchingEngine;
    private final WorkloadService workloadService;
    private final TaskAssignmentService taskAssignmentService;
    private final ObjectMapper objectMapper;

    public RecommendationService(RecommendationRepository recommendationRepository,
                                 RecommendationItemRepository recommendationItemRepository,
                                 FacultyProfileRepository facultyProfileRepository,
                                 TaskRepository taskRepository,
                                 TaskAssignmentRepository taskAssignmentRepository,
                                 UserRepository userRepository,
                                 AuditService auditService,
                                 MatchingEngine matchingEngine,
                                 WorkloadService workloadService,
                                 TaskAssignmentService taskAssignmentService,
                                 ObjectMapper objectMapper) {
        this.recommendationRepository = recommendationRepository;
        this.recommendationItemRepository = recommendationItemRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.taskRepository = taskRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.matchingEngine = matchingEngine;
        this.workloadService = workloadService;
        this.taskAssignmentService = taskAssignmentService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public List<RecommendationResponse> generateRecommendations(String hodUserId) {
        Optional<FacultyProfile> hodOpt = facultyProfileRepository.findByUserId(hodUserId);
        String deptId;
        User hodUser;
        if (hodOpt.isPresent()) {
            deptId = hodOpt.get().getDepartment().getId();
            hodUser = hodOpt.get().getUser();
        } else {
            deptId = "00000000-0000-0000-0000-000000000001";
            hodUser = userRepository.findById(hodUserId)
                    .orElseThrow(() -> new FacultyNotFoundException("Reviewer HOD user not found: " + hodUserId));
        }

        // 1. Mark existing PENDING recommendations in HOD department as STALE
        List<Recommendation> allPending = recommendationRepository.findByStatus(RecommendationStatus.PENDING);
        for (Recommendation rec : allPending) {
            if (rec.getOverloadedFaculty().getDepartment().getId().equals(deptId)) {
                rec.setStatus(RecommendationStatus.STALE);
                for (RecommendationItem item : rec.getItems()) {
                    item.setStatus(RecommendationStatus.STALE);
                }
                recommendationRepository.save(rec);
            }
        }

        // 2. Fetch active faculty in HOD's department
        List<FacultyProfile> profiles = facultyProfileRepository.findByDepartmentId(deptId).stream()
                .filter(p -> p.getUser().getAccountStatus() == AccountStatus.ACTIVE)
                .collect(Collectors.toList());

        List<Recommendation> generatedList = new ArrayList<>();

        for (FacultyProfile overloadedFaculty : profiles) {
            String sourceId = overloadedFaculty.getId();
            WorkloadSummary workload = workloadService.calculateWorkload(sourceId);

            // Check if overloaded
            if (workload.getCurrentHours() > workload.getMaxHours()) {
                int excessHours = workload.getCurrentHours() - workload.getMaxHours();

                // Fetch active assignments
                List<TaskAssignment> activeAssignments = taskAssignmentRepository.findByFacultyIdAndStatus(sourceId, AssignmentStatus.ACTIVE);

                // Sort tasks deterministically:
                // - greatest reduction of source excess: Math.min(task.weeklyHours, excessHours) DESC
                // - then smaller task weekly hours ASC
                // - then task ID ASC
                List<Task> sortedTasks = activeAssignments.stream()
                        .map(TaskAssignment::getTask)
                        .sorted(
                                Comparator.comparing((Task t) -> Math.min(t.getWeeklyHours(), excessHours)).reversed()
                                .thenComparing(Task::getWeeklyHours)
                                .thenComparing(Task::getId)
                        )
                        .collect(Collectors.toList());

                // Find first task that can be redistributed to an eligible candidate
                for (Task task : sortedTasks) {
                    MatchingResponse matching = matchingEngine.calculateSuitability(task.getId(), sourceId);
                    
                    // Filter matching.getCandidates() to find the best eligible target in the same department
                    Optional<CandidateResponse> bestCandidateOpt = matching.getCandidates().stream()
                            .filter(CandidateResponse::isEligible)
                            .findFirst();

                    if (bestCandidateOpt.isPresent()) {
                        CandidateResponse bestCandidate = bestCandidateOpt.get();
                        FacultyProfile targetFaculty = facultyProfileRepository.findById(bestCandidate.getFacultyId()).orElseThrow();

                        // Create Recommendation
                        Recommendation rec = new Recommendation();
                        rec.setOverloadedFaculty(overloadedFaculty);
                        rec.setStatus(RecommendationStatus.PENDING);
                        rec.setReason("Redistribute task " + task.getCode() + " (" + task.getWeeklyHours() + "h) from overloaded faculty " + overloadedFaculty.getUser().getFullName() + " to " + targetFaculty.getUser().getFullName() + ".");
                        rec = recommendationRepository.save(rec);

                        // Create RecommendationItem
                        RecommendationItem item = new RecommendationItem();
                        item.setRecommendation(rec);
                        item.setTask(task);
                        item.setTargetFaculty(targetFaculty);
                        item.setMatchScore((int) Math.round(bestCandidate.getFinalScore()));
                        item.setProjectedSourceHours(workload.getCurrentHours() - task.getWeeklyHours());
                        item.setProjectedTargetHours(bestCandidate.getCurrentHours() + task.getWeeklyHours());
                        item.setStatus(RecommendationStatus.PENDING);
                        recommendationItemRepository.save(item);

                        rec.getItems().add(item);

                        // Save Audit Event
                        auditService.logMutation(
                                "RECOMMENDATION_GENERATED",
                                "RECOMMENDATION",
                                rec.getId(),
                                hodUser,
                                Map.of(
                                        "recommendationId", rec.getId(),
                                        "sourceFacultyId", sourceId,
                                        "targetFacultyId", targetFaculty.getId(),
                                        "taskId", task.getId(),
                                        "matchScore", item.getMatchScore()
                                )
                        );

                        generatedList.add(rec);
                        break; // ONE task-move per overload case, proceed to next overloaded faculty
                    }
                }
            }
        }

        return generatedList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendations(String hodUserId) {
        Optional<FacultyProfile> hodOpt = facultyProfileRepository.findByUserId(hodUserId);
        String deptId = hodOpt.map(fp -> fp.getDepartment().getId())
                .orElse("00000000-0000-0000-0000-000000000001");

        return recommendationRepository.findAll().stream()
                .filter(rec -> rec.getOverloadedFaculty().getDepartment().getId().equals(deptId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(noRollbackFor = StaleRecommendationException.class)
    public RecommendationResponse approveRecommendation(String id, String reviewerUserId) {
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer user not found: " + reviewerUserId));

        Recommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + id));

        if (rec.getStatus() != RecommendationStatus.PENDING) {
            throw new IllegalStateException("Recommendation is already processed and is " + rec.getStatus());
        }

        RecommendationItem item = rec.getItems().get(0);
        String sourceId = rec.getOverloadedFaculty().getId();
        String targetId = item.getTargetFaculty().getId();
        Task task = item.getTask();

        // 1. Lock rows in ascending ID order to prevent deadlock
        String first = sourceId.compareTo(targetId) < 0 ? sourceId : targetId;
        String second = sourceId.compareTo(targetId) < 0 ? targetId : sourceId;
        facultyProfileRepository.findAndLockById(first);
        facultyProfileRepository.findAndLockById(second);

        // Load profiles from persistence context (now locked)
        FacultyProfile sourceProfile = facultyProfileRepository.findById(sourceId).orElseThrow();
        FacultyProfile targetProfile = facultyProfileRepository.findById(targetId).orElseThrow();

        // Check if stale
        boolean isStale = false;
        String staleReason = "";

        // Condition A: Faculty status changes
        if (sourceProfile.getUser().getAccountStatus() != AccountStatus.ACTIVE) {
            isStale = true;
            staleReason = "Source faculty is inactive";
        } else if (targetProfile.getUser().getAccountStatus() != AccountStatus.ACTIVE) {
            isStale = true;
            staleReason = "Target faculty is inactive";
        }
        // Condition B: Task status changes
        else if (!task.isActive()) {
            isStale = true;
            staleReason = "Task is archived";
        }
        // Condition C: Target department changed
        else if (!targetProfile.getDepartment().getId().equals(task.getDepartment().getId())) {
            isStale = true;
            staleReason = "Target faculty department mismatch";
        }
        // Condition D: Task was already reassigned or is no longer assigned to source
        else {
            Optional<TaskAssignment> currentActiveAssign = taskAssignmentRepository.findByTaskIdAndStatus(task.getId(), AssignmentStatus.ACTIVE);
            if (currentActiveAssign.isEmpty() || !currentActiveAssign.get().getFaculty().getId().equals(sourceId)) {
                isStale = true;
                staleReason = "Task assignment is no longer active on source faculty";
            }
        }

        // Condition E: Source is no longer overloaded or target no longer has capacity
        if (!isStale) {
            int sourceCurrent = taskAssignmentRepository.calculateCurrentWorkloadHours(sourceId);
            int targetCurrent = taskAssignmentRepository.calculateCurrentWorkloadHours(targetId);
            int taskHours = task.getWeeklyHours();

            if (sourceCurrent <= sourceProfile.getMaxWorkloadHours()) {
                isStale = true;
                staleReason = "Source faculty is no longer overloaded";
            } else if (targetCurrent + taskHours > targetProfile.getMaxWorkloadHours()) {
                isStale = true;
                staleReason = "Target faculty has insufficient capacity";
            }
        }

        if (isStale) {
            // Persist STALE state and commit
            rec.setStatus(RecommendationStatus.STALE);
            item.setStatus(RecommendationStatus.STALE);
            rec.setReviewedAt(Instant.now());
            rec.setReason("Stale recommendation: " + staleReason);
            recommendationRepository.saveAndFlush(rec);

            throw new StaleRecommendationException(id, "Recommendation is no longer valid: " + staleReason);
        }

        // 2. Perform actual reassignment (delegates to TaskAssignmentService)
        taskAssignmentService.reassignTask(task.getId(), targetId, reviewerUserId);

        // 3. Update recommendation status to APPLIED
        rec.setStatus(RecommendationStatus.APPLIED);
        item.setStatus(RecommendationStatus.APPLIED);
        rec.setReviewedAt(Instant.now());
        recommendationRepository.saveAndFlush(rec);

        // 4. Write Audit Log
        auditService.logMutation(
                "RECOMMENDATION_APPLIED",
                "RECOMMENDATION",
                rec.getId(),
                reviewer,
                Map.of(
                        "recommendationId", rec.getId(),
                        "taskId", task.getId(),
                        "sourceFacultyId", sourceId,
                        "targetFacultyId", targetId,
                        "appliedBy", reviewer.getInstitutionalId()
                )
        );

        return mapToResponse(rec);
    }

    @Transactional
    public RecommendationResponse rejectRecommendation(String id, String reviewerUserId) {
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer user not found: " + reviewerUserId));

        Recommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + id));

        if (rec.getStatus() != RecommendationStatus.PENDING) {
            throw new IllegalStateException("Recommendation is already processed and is " + rec.getStatus());
        }

        rec.setStatus(RecommendationStatus.REJECTED);
        for (RecommendationItem item : rec.getItems()) {
            item.setStatus(RecommendationStatus.REJECTED);
        }
        rec.setReviewedAt(Instant.now());
        recommendationRepository.save(rec);

        // Write Audit Log
        auditService.logMutation(
                "RECOMMENDATION_REJECTED",
                "RECOMMENDATION",
                rec.getId(),
                reviewer,
                Map.of(
                        "recommendationId", rec.getId(),
                        "rejectedBy", reviewer.getInstitutionalId()
                )
        );

        return mapToResponse(rec);
    }

    private RecommendationResponse mapToResponse(Recommendation rec) {
        List<RecommendationItemResponse> items = rec.getItems().stream()
                .map(item -> {
                    Task task = item.getTask();
                    FacultyProfile source = rec.getOverloadedFaculty();
                    FacultyProfile target = item.getTargetFaculty();

                    // Calculate actual current workloads
                    int sourceCurrent = taskAssignmentRepository.calculateCurrentWorkloadHours(source.getId());
                    int targetCurrent = taskAssignmentRepository.calculateCurrentWorkloadHours(target.getId());

                    String sourceCurrentStatus = calculateStatus(sourceCurrent, source.getMaxWorkloadHours());
                    String sourceProjectedStatus = calculateStatus(item.getProjectedSourceHours(), source.getMaxWorkloadHours());

                    String targetCurrentStatus = calculateStatus(targetCurrent, target.getMaxWorkloadHours());
                    String targetProjectedStatus = calculateStatus(item.getProjectedTargetHours(), target.getMaxWorkloadHours());

                    return new RecommendationItemResponse(
                            item.getId(),
                            task.getId(),
                            task.getTitle(),
                            task.getCode(),
                            task.getWeeklyHours(),
                            source.getId(),
                            source.getUser().getFullName(),
                            target.getId(),
                            target.getUser().getFullName(),
                            item.getMatchScore(),
                            sourceCurrent,
                            source.getMaxWorkloadHours(),
                            item.getProjectedSourceHours(),
                            sourceCurrentStatus,
                            sourceProjectedStatus,
                            targetCurrent,
                            target.getMaxWorkloadHours(),
                            item.getProjectedTargetHours(),
                            targetCurrentStatus,
                            targetProjectedStatus
                    );
                })
                .collect(Collectors.toList());

        return new RecommendationResponse(
                rec.getId(),
                rec.getStatus().name(),
                rec.getReason(),
                rec.getCreatedAt(),
                rec.getReviewedAt(),
                items
        );
    }

    private String calculateStatus(int currentHours, int maxHours) {
        if (maxHours <= 0) {
            return "UNDERLOADED";
        }
        if (currentHours > maxHours) {
            return "OVERLOADED";
        }
        double ratio = (double) currentHours / maxHours;
        if (ratio >= 0.80) {
            return "BALANCED";
        } else {
            return "UNDERLOADED";
        }
    }
}
