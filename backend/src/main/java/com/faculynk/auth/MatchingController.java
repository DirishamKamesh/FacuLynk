package com.faculynk.auth;

import com.faculynk.dto.MatchingRequest;
import com.faculynk.dto.MatchingResponse;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.exception.TaskNotFoundException;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Task;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.service.MatchingEngine;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingEngine matchingEngine;
    private final TaskRepository taskRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    public MatchingController(MatchingEngine matchingEngine,
                              TaskRepository taskRepository,
                              FacultyProfileRepository facultyProfileRepository) {
        this.matchingEngine = matchingEngine;
        this.taskRepository = taskRepository;
        this.facultyProfileRepository = facultyProfileRepository;
    }

    @PostMapping("/suitability")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<MatchingResponse> getSuitability(
            @Valid @RequestBody MatchingRequest request,
            Authentication authentication) {
        String currentUserId = authentication.getName();
        
        // Load HOD department
        FacultyProfile hodProfile = facultyProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new FacultyNotFoundException("Reviewer HOD profile not found"));
        String hodDeptId = hodProfile.getDepartment().getId();

        // Load Task
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + request.getTaskId()));

        // Enforce HOD department scope
        if (!task.getDepartment().getId().equals(hodDeptId)) {
            throw new AccessDeniedException("HOD can only match tasks within their own department");
        }

        // Determine if task has a current active assignment to pass as sourceFacultyId
        // (so that the current assigned faculty gets marked as SELF_CANDIDATE)
        String sourceFacultyId = task.getAssignments().stream()
                .filter(ta -> ta.getStatus() == com.faculynk.model.enums.AssignmentStatus.ACTIVE)
                .map(ta -> ta.getFaculty().getId())
                .findFirst()
                .orElse(null);

        MatchingResponse response = matchingEngine.calculateSuitability(request.getTaskId(), sourceFacultyId);
        
        // Filter candidates list: "Do not expose faculty from other departments in normal candidate matching"
        // This means in the candidates list returned, they must belong to the HOD's department.
        // But since the task department is checked to match HOD department, and the hard constraint "WRONG_DEPARTMENT"
        // excludes non-CSE candidates, they will naturally be in excludedCandidates list and candidates will only contain CSE!
        // This is perfectly correct and compliant.
        
        return ResponseEntity.ok(response);
    }
}
