package com.faculynk.service;

import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.repository.FacultyProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workload")
public class WorkloadController {

    private final WorkloadService workloadService;
    private final FacultyProfileRepository facultyProfileRepository;

    public WorkloadController(WorkloadService workloadService,
                              FacultyProfileRepository facultyProfileRepository) {
        this.workloadService = workloadService;
        this.facultyProfileRepository = facultyProfileRepository;
    }

    @GetMapping("/matrix")
    public ResponseEntity<List<WorkloadSummary>> getDepartmentWorkloadMatrix(
            @RequestParam(required = false) String departmentId,
            Authentication authentication) {
        String currentRole = getRoleFromAuthentication(authentication);
        
        // HOD only
        if (!"HOD".equals(currentRole)) {
            throw new AccessDeniedException("Only HOD can access workload matrix");
        }

        String finalDeptId = departmentId;
        if (finalDeptId == null || finalDeptId.trim().isEmpty()) {
            // Default to HOD's department
            String userId = authentication.getName();
            FacultyProfile hodProfile = facultyProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new FacultyNotFoundException("Reviewer HOD profile not found"));
            finalDeptId = hodProfile.getDepartment().getId();
        }

        List<WorkloadSummary> matrix = workloadService.getDepartmentWorkloadMatrix(finalDeptId);
        return ResponseEntity.ok(matrix);
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<WorkloadSummary> getFacultyWorkloadSummary(
            @PathVariable String id,
            Authentication authentication) {
        String currentUserId = authentication.getName();
        String currentRole = getRoleFromAuthentication(authentication);

        // Enforce ownership: Faculty user can only access their own workload
        if (!"HOD".equals(currentRole)) {
            FacultyProfile profile = facultyProfileRepository.findById(id)
                    .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found: " + id));
            if (!profile.getUser().getId().equals(currentUserId)) {
                throw new AccessDeniedException("Access denied: You can only view your own workload");
            }
        }

        WorkloadSummary summary = workloadService.calculateWorkload(id);
        return ResponseEntity.ok(summary);
    }

    private String getRoleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                .findFirst()
                .orElse("FACULTY");
    }
}
