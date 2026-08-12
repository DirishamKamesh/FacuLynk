package com.faculynk.dto;

import java.time.Instant;
import java.util.List;

public class RecommendationResponse {

    private String id;
    private String status;
    private String reason;
    private Instant createdAt;
    private Instant reviewedAt;
    private List<RecommendationItemResponse> items;

    public RecommendationResponse() {
    }

    public RecommendationResponse(String id, String status, String reason, Instant createdAt, Instant reviewedAt, List<RecommendationItemResponse> items) {
        this.id = id;
        this.status = status;
        this.reason = reason;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
        this.items = items;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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

    public List<RecommendationItemResponse> getItems() {
        return items;
    }

    public void setItems(List<RecommendationItemResponse> items) {
        this.items = items;
    }
}
