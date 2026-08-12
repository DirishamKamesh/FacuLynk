package com.faculynk.auth;

import com.faculynk.dto.FacultyCreateRequest;
import com.faculynk.dto.FacultyProfileUpdateRequest;
import com.faculynk.dto.FacultyResponse;
import com.faculynk.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<List<FacultyResponse>> getAllFaculty() {
        List<FacultyResponse> list = facultyService.getAllFaculty();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<FacultyResponse> getFacultyById(@PathVariable String id) {
        FacultyResponse response = facultyService.getFacultyById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<FacultyResponse> getOwnProfile(Authentication authentication) {
        String userId = authentication.getName();
        FacultyResponse response = facultyService.getFacultyByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<FacultyResponse> createFaculty(@Valid @RequestBody FacultyCreateRequest request) {
        FacultyResponse response = facultyService.createFaculty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<FacultyResponse> updateFaculty(
            @PathVariable String id,
            @RequestBody FacultyProfileUpdateRequest request) {
        FacultyResponse response = facultyService.updateFaculty(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<FacultyResponse> selfUpdateProfile(
            @RequestBody FacultyProfileUpdateRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        FacultyResponse response = facultyService.selfUpdateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<Void> softDeactivateFaculty(@PathVariable String id) {
        facultyService.softDeactivateFaculty(id);
        return ResponseEntity.noContent().build();
    }
}
