package com.faculynk.service;

import com.faculynk.dto.TaskRequest;
import com.faculynk.dto.TaskResponse;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.exception.InvalidDepartmentException;
import com.faculynk.exception.InvalidResponsibilityTypeException;
import com.faculynk.exception.TaskNotFoundException;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.model.enums.TaskPriority;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.SkillRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.service.AuditService;
import com.faculynk.model.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final SkillRepository skillRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public TaskService(TaskRepository taskRepository,
                       FacultyProfileRepository facultyProfileRepository,
                       DepartmentRepository departmentRepository,
                       SkillRepository skillRepository,
                       TaskAssignmentRepository taskAssignmentRepository,
                       UserRepository userRepository,
                       AuditService auditService) {
        this.taskRepository = taskRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.departmentRepository = departmentRepository;
        this.skillRepository = skillRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(String currentUserId, String currentRole) {
        List<Task> tasks;
        if ("HOD".equals(currentRole)) {
            tasks = taskRepository.findAll();
        } else {
            FacultyProfile fp = facultyProfileRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found for user ID: " + currentUserId));
            tasks = taskRepository.findByDepartmentId(fp.getDepartment().getId());
        }

        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(String id, String currentUserId, String currentRole) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id));

        if (!"HOD".equals(currentRole)) {
            FacultyProfile fp = facultyProfileRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found for user ID: " + currentUserId));
            if (!task.getDepartment().getId().equals(fp.getDepartment().getId())) {
                throw new AccessDeniedException("You are not authorized to view tasks outside your department");
            }
        }

        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, String hodUserId) {
        User hodUser = userRepository.findById(hodUserId)
                .orElseThrow(() -> new IllegalArgumentException("HOD user not found: " + hodUserId));

        // Validate Responsibility Type
        ResponsibilityType type;
        try {
            type = ResponsibilityType.valueOf(request.getType());
        } catch (IllegalArgumentException e) {
            throw new InvalidResponsibilityTypeException("Invalid responsibility type: " + request.getType());
        }

        // Validate Task Priority
        TaskPriority priority;
        try {
            priority = TaskPriority.valueOf(request.getPriority());
        } catch (Exception e) {
            priority = TaskPriority.MEDIUM;
        }

        // Validate Department existence
        Department department = departmentRepository.findByCode(request.getDepartment())
                .or(() -> departmentRepository.findByName(request.getDepartment()))
                .orElseThrow(() -> new InvalidDepartmentException("Department does not exist: " + request.getDepartment()));

        // Create Task
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setCode(request.getCode());
        task.setType(type);
        task.setWeeklyHours(request.getWeeklyHours());
        task.setPriority(priority);
        task.setDepartment(department);
        task.setSemester(request.getSemester());
        task.setDeadline(request.getDeadline());
        task.setDescription(request.getDescription());
        task.setActive(true);

        // Normalize skills
        if (request.getRequiredSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String name : request.getRequiredSkills()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    Skill skill = skillRepository.findByName(trimmed)
                            .orElseGet(() -> {
                                Skill s = new Skill();
                                s.setName(trimmed);
                                return skillRepository.save(s);
                            });
                    skills.add(skill);
                }
            }
            task.setRequiredSkills(skills);
        }

        task = taskRepository.save(task);

        auditService.logMutation(
                "TASK_CREATED",
                "TASK",
                task.getId(),
                hodUser,
                java.util.Map.of("taskId", task.getId(), "createdBy", hodUser.getInstitutionalId())
        );

        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(String id, TaskRequest request, String hodUserId) {
        User hodUser = userRepository.findById(hodUserId)
                .orElseThrow(() -> new IllegalArgumentException("HOD user not found: " + hodUserId));

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id));

        // Validate Responsibility Type
        if (request.getType() != null) {
            try {
                task.setType(ResponsibilityType.valueOf(request.getType()));
            } catch (IllegalArgumentException e) {
                throw new InvalidResponsibilityTypeException("Invalid responsibility type: " + request.getType());
            }
        }

        // Validate Task Priority
        if (request.getPriority() != null) {
            try {
                task.setPriority(TaskPriority.valueOf(request.getPriority()));
            } catch (Exception e) {
                task.setPriority(TaskPriority.MEDIUM);
            }
        }

        // Validate Department
        if (request.getDepartment() != null) {
            Department department = departmentRepository.findByCode(request.getDepartment())
                    .or(() -> departmentRepository.findByName(request.getDepartment()))
                    .orElseThrow(() -> new InvalidDepartmentException("Department does not exist: " + request.getDepartment()));
            task.setDepartment(department);
        }

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getCode() != null) {
            task.setCode(request.getCode());
        }
        if (request.getWeeklyHours() > 0) {
            task.setWeeklyHours(request.getWeeklyHours());
        }
        if (request.getSemester() != null) {
            task.setSemester(request.getSemester());
        }
        if (request.getDeadline() != null) {
            task.setDeadline(request.getDeadline());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        // Update skills
        if (request.getRequiredSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String name : request.getRequiredSkills()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    Skill skill = skillRepository.findByName(trimmed)
                            .orElseGet(() -> {
                                Skill s = new Skill();
                                s.setName(trimmed);
                                return skillRepository.save(s);
                            });
                    skills.add(skill);
                }
            }
            task.getRequiredSkills().clear();
            task.getRequiredSkills().addAll(skills);
        }

        task = taskRepository.save(task);

        auditService.logMutation(
                "TASK_UPDATED",
                "TASK",
                task.getId(),
                hodUser,
                java.util.Map.of("taskId", task.getId(), "updatedBy", hodUser.getInstitutionalId())
        );

        return mapToResponse(task);
    }

    @Transactional
    public void archiveTask(String id, String hodUserId) {
        User hodUser = userRepository.findById(hodUserId)
                .orElseThrow(() -> new IllegalArgumentException("HOD user not found: " + hodUserId));

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id));

        // Soft deactivation of the task
        task.setActive(false);

        // Close active assignment if exists
        Optional<TaskAssignment> activeAssignment = taskAssignmentRepository.findByTaskIdAndStatus(id, AssignmentStatus.ACTIVE);
        if (activeAssignment.isPresent()) {
            TaskAssignment assignment = activeAssignment.get();
            assignment.setStatus(AssignmentStatus.CLOSED);
            assignment.setClosedAt(Instant.now());
            assignment.setClosedReason("Task archived");
            taskAssignmentRepository.save(assignment);
        }

        taskRepository.save(task);

        auditService.logMutation(
                "TASK_ARCHIVED",
                "TASK",
                task.getId(),
                hodUser,
                java.util.Map.of("taskId", task.getId(), "archivedBy", hodUser.getInstitutionalId())
        );
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
