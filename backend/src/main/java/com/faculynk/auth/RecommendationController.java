package com.faculynk.auth;

import com.faculynk.dto.RecommendationResponse;
import com.faculynk.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<List<RecommendationResponse>> generateRecommendations(Authentication authentication) {
        String hodUserId = authentication.getName();
        List<RecommendationResponse> list = recommendationService.generateRecommendations(hodUserId);
        return ResponseEntity.ok(list);
    }

    @GetMapping
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(Authentication authentication) {
        String hodUserId = authentication.getName();
        List<RecommendationResponse> list = recommendationService.getRecommendations(hodUserId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<RecommendationResponse> approveRecommendation(
            @PathVariable String id,
            Authentication authentication) {
        String reviewerUserId = authentication.getName();
        RecommendationResponse response = recommendationService.approveRecommendation(id, reviewerUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<RecommendationResponse> rejectRecommendation(
            @PathVariable String id,
            Authentication authentication) {
        String reviewerUserId = authentication.getName();
        RecommendationResponse response = recommendationService.rejectRecommendation(id, reviewerUserId);
        return ResponseEntity.ok(response);
    }
}
