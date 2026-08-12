package com.faculynk.service;

import com.faculynk.dto.TaskResponse;
import com.faculynk.exception.CapacityExceededException;
import com.faculynk.exception.FacultyInactiveException;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.exception.InvalidAssignmentException;
import com.faculynk.exception.TaskAlreadyAssignedException;
import com.faculynk.exception.TaskNotFoundException;
import com.faculynk.model.entity.AuditLog;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.service.AuditService;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskAssignmentService {

    private final TaskRepository taskRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public TaskAssignmentService(TaskRepository taskRepository,
                                 FacultyProfileRepository facultyProfileRepository,
                                 TaskAssignmentRepository taskAssignmentRepository,
                                 UserRepository userRepository,
                                 AuditService auditService,
                                 ObjectMapper objectMapper) {
        this.taskRepository = taskRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public TaskResponse assignTask(String taskId, String targetFacultyId, String reviewerUserId) {
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer HOD not found: " + reviewerUserId));

        // 1. Task exists and is active
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
        if (!task.isActive()) {
            throw new InvalidAssignmentException("Cannot assign inactive task: " + taskId);
        }

        // 2. Lock target faculty
        FacultyProfile faculty = facultyProfileRepository.findAndLockById(targetFacultyId)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty not found: " + targetFacultyId));

        // 3. Faculty active
        if (faculty.getUser().getAccountStatus() != AccountStatus.ACTIVE) {
            throw new FacultyInactiveException("Cannot assign task to inactive faculty member: " + targetFacultyId);
        }

        // 4. Faculty department matches task department
        if (!faculty.getDepartment().getId().equals(task.getDepartment().getId())) {
            throw new InvalidAssignmentException("Faculty department does not match task department");
        }

        // 5. Task has no active assignment
        boolean alreadyAssigned = taskAssignmentRepository.existsByTaskIdAndStatus(taskId, AssignmentStatus.ACTIVE);
        if (alreadyAssigned) {
            throw new TaskAlreadyAssignedException("Task already has an active assignment: " + taskId);
        }

        // 6. Verify capacity
        int currentHours = taskAssignmentRepository.calculateCurrentWorkloadHours(targetFacultyId);
        int maxHours = faculty.getMaxWorkloadHours();
        int taskHours = task.getWeeklyHours();
        int projectedHours = currentHours + taskHours;

        if (projectedHours > maxHours) {
            throw new CapacityExceededException(targetFacultyId, currentHours, taskHours, projectedHours, maxHours);
        }

        // 7. Create TaskAssignment
        TaskAssignment assignment = new TaskAssignment();
        assignment.setTask(task);
        assignment.setFaculty(faculty);
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setAssignedAt(Instant.now());
        assignment = taskAssignmentRepository.save(assignment);

        // 8. Write Audit Log
        auditService.logMutation(
                "TASK_ASSIGNED",
                "TASK_ASSIGNMENT",
                assignment.getId(),
                reviewer,
                Map.of(
                        "taskId", taskId,
                        "facultyId", targetFacultyId,
                        "weeklyHours", taskHours,
                        "assignedBy", reviewer.getInstitutionalId()
                )
        );

        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse reassignTask(String taskId, String targetFacultyId, String reviewerUserId) {
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer HOD not found: " + reviewerUserId));

        // 1. Task exists and is active
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
        if (!task.isActive()) {
            throw new InvalidAssignmentException("Cannot reassign inactive task: " + taskId);
        }

        // 2. Identify the deterministic locking order for affected faculty rows
        Optional<TaskAssignment> activeAssignmentOpt = taskAssignmentRepository.findByTaskIdAndStatus(taskId, AssignmentStatus.ACTIVE);
        String oldFacultyId = activeAssignmentOpt.map(ta -> ta.getFaculty().getId()).orElse(null);
        String newFacultyId = targetFacultyId;

        if (oldFacultyId != null && !oldFacultyId.equals(newFacultyId)) {
            String first = oldFacultyId.compareTo(newFacultyId) < 0 ? oldFacultyId : newFacultyId;
            String second = oldFacultyId.compareTo(newFacultyId) < 0 ? newFacultyId : oldFacultyId;
            facultyProfileRepository.findAndLockById(first);
            facultyProfileRepository.findAndLockById(second);
        } else {
            facultyProfileRepository.findAndLockById(newFacultyId);
        }

        // Load profiles from persistence context (which are now locked)
        FacultyProfile faculty = facultyProfileRepository.findById(targetFacultyId)
                .orElseThrow(() -> new FacultyNotFoundException("Target faculty not found: " + targetFacultyId));

        // 3. Faculty active
        if (faculty.getUser().getAccountStatus() != AccountStatus.ACTIVE) {
            throw new FacultyInactiveException("Cannot assign task to inactive faculty member: " + targetFacultyId);
        }

        // 4. Faculty department matches task department
        if (!faculty.getDepartment().getId().equals(task.getDepartment().getId())) {
            throw new InvalidAssignmentException("Faculty department does not match task department");
        }

        // 5. Verify capacity
        int currentHours = taskAssignmentRepository.calculateCurrentWorkloadHours(targetFacultyId);
        
        // If the task was already active-assigned to the same faculty, subtracting it prevents double-counting!
        // But since we are assigning/reassigning, we verify capacity.
        int taskHours = task.getWeeklyHours();
        int projectedHours = currentHours + taskHours;
        
        // If reassigning to a different faculty, check target capacity.
        // If reassigning to the same faculty (noop), projectedHours would be identical.
        int maxHours = faculty.getMaxWorkloadHours();

        if (oldFacultyId != null && oldFacultyId.equals(newFacultyId)) {
            // Already assigned to this faculty, no actual workload increase
            projectedHours = currentHours;
        }

        if (projectedHours > maxHours) {
            throw new CapacityExceededException(targetFacultyId, currentHours, taskHours, projectedHours, maxHours);
        }

        // 6. Close existing active assignment
        if (activeAssignmentOpt.isPresent()) {
            TaskAssignment oldAssignment = activeAssignmentOpt.get();
            if (!oldAssignment.getFaculty().getId().equals(targetFacultyId)) {
                oldAssignment.setStatus(AssignmentStatus.CLOSED);
                oldAssignment.setClosedAt(Instant.now());
                oldAssignment.setClosedReason("Reassigned to faculty ID " + targetFacultyId);
                taskAssignmentRepository.saveAndFlush(oldAssignment);
            } else {
                // Already assigned to the same faculty, return mapped DTO directly
                return mapToResponse(task);
            }
        }

        // 7. Create new active assignment
        TaskAssignment assignment = new TaskAssignment();
        assignment.setTask(task);
        assignment.setFaculty(faculty);
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setAssignedAt(Instant.now());
        assignment = taskAssignmentRepository.save(assignment);

        // 8. Write Audit Log
        auditService.logMutation(
                "TASK_REASSIGNED",
                "TASK_ASSIGNMENT",
                assignment.getId(),
                reviewer,
                Map.of(
                        "taskId", taskId,
                        "oldFacultyId", oldFacultyId != null ? oldFacultyId : "NONE",
                        "newFacultyId", targetFacultyId,
                        "weeklyHours", taskHours,
                        "reassignedBy", reviewer.getInstitutionalId()
                )
        );

        return mapToResponse(task);
    }

    private TaskResponse mapToResponse(Task task) {
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
