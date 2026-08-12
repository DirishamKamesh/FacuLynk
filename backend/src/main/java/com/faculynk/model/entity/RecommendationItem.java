package com.faculynk.model.entity;

import com.faculynk.model.enums.RecommendationStatus;
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

import java.util.UUID;

@Entity
@Table(name = "recommendation_items")
public class RecommendationItem {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private Recommendation recommendation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_faculty_id", nullable = false)
    private FacultyProfile targetFaculty;

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(name = "projected_source_hours")
    private Integer projectedSourceHours;

    @Column(name = "projected_target_hours")
    private Integer projectedTargetHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RecommendationStatus status = RecommendationStatus.PENDING;

    public RecommendationItem() {
    }

    public RecommendationItem(String id, Recommendation recommendation, Task task, FacultyProfile targetFaculty, Integer matchScore, Integer projectedSourceHours, Integer projectedTargetHours, RecommendationStatus status) {
        this.id = id;
        this.recommendation = recommendation;
        this.task = task;
        this.targetFaculty = targetFaculty;
        this.matchScore = matchScore;
        this.projectedSourceHours = projectedSourceHours;
        this.projectedTargetHours = projectedTargetHours;
        this.status = status;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Recommendation getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(Recommendation recommendation) {
        this.recommendation = recommendation;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public FacultyProfile getTargetFaculty() {
        return targetFaculty;
    }

    public void setTargetFaculty(FacultyProfile targetFaculty) {
        this.targetFaculty = targetFaculty;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
    }

    public Integer getProjectedSourceHours() {
        return projectedSourceHours;
    }

    public void setProjectedSourceHours(Integer projectedSourceHours) {
        this.projectedSourceHours = projectedSourceHours;
    }

    public Integer getProjectedTargetHours() {
        return projectedTargetHours;
    }

    public void setProjectedTargetHours(Integer projectedTargetHours) {
        this.projectedTargetHours = projectedTargetHours;
    }

    public RecommendationStatus getStatus() {
        return status;
    }

    public void setStatus(RecommendationStatus status) {
        this.status = status;
    }
}
