package com.faculynk.auth;

import com.faculynk.dto.AssignmentRequest;
import com.faculynk.service.TaskAssignmentService;
import com.faculynk.dto.TaskRequest;
import com.faculynk.dto.TaskResponse;
import com.faculynk.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskAssignmentService taskAssignmentService;

    public TaskController(TaskService taskService, TaskAssignmentService taskAssignmentService) {
        this.taskService = taskService;
        this.taskAssignmentService = taskAssignmentService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(Authentication authentication) {
        String currentUserId = authentication.getName();
        String currentRole = getRoleFromAuthentication(authentication);
        List<TaskResponse> list = taskService.getAllTasks(currentUserId, currentRole);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable String id, Authentication authentication) {
        String currentUserId = authentication.getName();
        String currentRole = getRoleFromAuthentication(authentication);
        TaskResponse response = taskService.getTaskById(id, currentUserId, currentRole);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request, Authentication authentication) {
        TaskResponse response = taskService.createTask(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable String id, @RequestBody TaskRequest request, Authentication authentication) {
        TaskResponse response = taskService.updateTask(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<Void> archiveTask(@PathVariable String id, Authentication authentication) {
        taskService.archiveTask(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable String id,
            @Valid @RequestBody AssignmentRequest request,
            Authentication authentication) {
        String reviewerUserId = authentication.getName();
        TaskResponse response = taskAssignmentService.assignTask(id, request.getFacultyId(), reviewerUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reassign")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<TaskResponse> reassignTask(
            @PathVariable String id,
            @Valid @RequestBody AssignmentRequest request,
            Authentication authentication) {
        String reviewerUserId = authentication.getName();
        TaskResponse response = taskAssignmentService.reassignTask(id, request.getFacultyId(), reviewerUserId);
        return ResponseEntity.ok(response);
    }

    private String getRoleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                .findFirst()
                .orElse("FACULTY");
    }
}
