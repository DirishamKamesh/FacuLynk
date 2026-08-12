package com.faculynk.dto;

public class ExcludedCandidateResponse {

    private String facultyId;
    private String facultyName;
    private String reason;

    public ExcludedCandidateResponse() {
    }

    public ExcludedCandidateResponse(String facultyId, String facultyName, String reason) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.reason = reason;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
