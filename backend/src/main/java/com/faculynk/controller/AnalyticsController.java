package com.faculynk.controller;

import com.faculynk.dto.AnalyticsResponse;
import com.faculynk.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.faculynk.repository.FacultyProfileRepository;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final FacultyProfileRepository facultyProfileRepository;

    public AnalyticsController(AnalyticsService analyticsService, FacultyProfileRepository facultyProfileRepository) {
        this.analyticsService = analyticsService;
        this.facultyProfileRepository = facultyProfileRepository;
    }

    @GetMapping("/dashboard-summary")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<AnalyticsResponse> getDashboardSummary(Authentication authentication) {
        String userId = authentication.getName();
        String departmentId = facultyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("HOD profile not found"))
                .getDepartment().getId();
        AnalyticsResponse response = analyticsService.getDepartmentAnalytics(departmentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<AnalyticsResponse> getReports(Authentication authentication) {
        String userId = authentication.getName();
        String departmentId = facultyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("HOD profile not found"))
                .getDepartment().getId();
        AnalyticsResponse response = analyticsService.getDepartmentAnalytics(departmentId);
        return ResponseEntity.ok(response);
    }
}
