package com.faculynk.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignmentRequest {

    @NotBlank(message = "Faculty ID is required")
    private String facultyId;

    public AssignmentRequest() {
    }

    public AssignmentRequest(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }
}
