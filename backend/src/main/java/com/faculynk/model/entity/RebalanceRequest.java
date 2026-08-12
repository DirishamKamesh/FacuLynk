package com.faculynk.model.entity;

import com.faculynk.model.enums.RebalanceRequestType;
import com.faculynk.model.enums.RebalanceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rebalance_requests")
public class RebalanceRequest {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 50)
    private RebalanceRequestType requestType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_faculty_id", nullable = false)
    private FacultyProfile requesterFaculty;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_overloaded_faculty_id", nullable = false)
    private FacultyProfile targetOverloadedFaculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_assignee_faculty_id")
    private FacultyProfile suggestedAssigneeFaculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(name = "reason", nullable = false, columnDefinition = "text")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RebalanceStatus status = RebalanceStatus.PENDING;

    @Column(name = "hod_note", columnDefinition = "text")
    private String hodNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public RebalanceRequest() {
    }

    public RebalanceRequest(String id, RebalanceRequestType requestType, FacultyProfile requesterFaculty, FacultyProfile targetOverloadedFaculty, FacultyProfile suggestedAssigneeFaculty, Task task, String reason, RebalanceStatus status, String hodNote, Instant createdAt, Instant reviewedAt) {
        this.id = id;
        this.requestType = requestType;
        this.requesterFaculty = requesterFaculty;
        this.targetOverloadedFaculty = targetOverloadedFaculty;
        this.suggestedAssigneeFaculty = suggestedAssigneeFaculty;
        this.task = task;
        this.reason = reason;
        this.status = status;
        this.hodNote = hodNote;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public RebalanceRequestType getRequestType() {
        return requestType;
    }

    public void setRequestType(RebalanceRequestType requestType) {
        this.requestType = requestType;
    }

    public FacultyProfile getRequesterFaculty() {
        return requesterFaculty;
    }

    public void setRequesterFaculty(FacultyProfile requesterFaculty) {
        this.requesterFaculty = requesterFaculty;
    }

    public FacultyProfile getTargetOverloadedFaculty() {
        return targetOverloadedFaculty;
    }

    public void setTargetOverloadedFaculty(FacultyProfile targetOverloadedFaculty) {
        this.targetOverloadedFaculty = targetOverloadedFaculty;
    }

    public FacultyProfile getSuggestedAssigneeFaculty() {
        return suggestedAssigneeFaculty;
    }

    public void setSuggestedAssigneeFaculty(FacultyProfile suggestedAssigneeFaculty) {
        this.suggestedAssigneeFaculty = suggestedAssigneeFaculty;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public RebalanceStatus getStatus() {
        return status;
    }

    public void setStatus(RebalanceStatus status) {
        this.status = status;
    }

    public String getHodNote() {
        return hodNote;
    }

    public void setHodNote(String hodNote) {
        this.hodNote = hodNote;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
