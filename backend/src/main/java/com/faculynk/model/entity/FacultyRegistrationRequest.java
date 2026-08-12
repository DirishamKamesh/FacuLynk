package com.faculynk.model.entity;

import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.RegistrationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "faculty_registration_requests")
public class FacultyRegistrationRequest {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "institutional_id", nullable = false, length = 50)
    private String institutionalId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Convert(converter = Designation.DesignationConverter.class)
    @Column(name = "designation", nullable = false, length = 50)
    private Designation designation;

    @Column(name = "department_name", nullable = false)
    private String departmentName;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "skills_json", columnDefinition = "json")
    private String skillsJson;

    @Column(name = "availability", length = 100)
    private String availability;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(name = "hod_note", columnDefinition = "text")
    private String hodNote;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public FacultyRegistrationRequest() {
    }

    public FacultyRegistrationRequest(String id, String institutionalId, String email, String passwordHash, String fullName, Designation designation, String departmentName, String phone, String skillsJson, String availability, RegistrationStatus status, String hodNote, Instant submittedAt, Instant reviewedAt) {
        this.id = id;
        this.institutionalId = institutionalId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.designation = designation;
        this.departmentName = departmentName;
        this.phone = phone;
        this.skillsJson = skillsJson;
        this.availability = availability;
        this.status = status;
        this.hodNote = hodNote;
        this.submittedAt = submittedAt;
        this.reviewedAt = reviewedAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.submittedAt == null) {
            this.submittedAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInstitutionalId() {
        return institutionalId;
    }

    public void setInstitutionalId(String institutionalId) {
        this.institutionalId = institutionalId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Designation getDesignation() {
        return designation;
    }

    public void setDesignation(Designation designation) {
        this.designation = designation;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSkillsJson() {
        return skillsJson;
    }

    public void setSkillsJson(String skillsJson) {
        this.skillsJson = skillsJson;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public String getHodNote() {
        return hodNote;
    }

    public void setHodNote(String hodNote) {
        this.hodNote = hodNote;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
