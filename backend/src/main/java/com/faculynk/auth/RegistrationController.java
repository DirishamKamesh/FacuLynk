package com.faculynk.auth;

import com.faculynk.auth.dto.AuthUserResponse;
import com.faculynk.auth.dto.RejectionRequest;
import com.faculynk.model.entity.FacultyRegistrationRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/verification-requests")
@PreAuthorize("hasRole('HOD')")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping
    public ResponseEntity<List<FacultyRegistrationRequest>> getPendingRequests() {
        List<FacultyRegistrationRequest> requests = registrationService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AuthUserResponse> approveRegistration(@PathVariable String id, Authentication authentication) {
        String reviewerUserId = authentication.getName(); // JWT sub holds user UUID string
        AuthUserResponse response = registrationService.approveRegistration(id, reviewerUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<FacultyRegistrationRequest> rejectRegistration(
            @PathVariable String id,
            @Valid @RequestBody RejectionRequest request,
            Authentication authentication) {
        String reviewerUserId = authentication.getName();
        FacultyRegistrationRequest response = registrationService.rejectRegistration(id, reviewerUserId, request.getHodNote());
        return ResponseEntity.ok(response);
    }
}
