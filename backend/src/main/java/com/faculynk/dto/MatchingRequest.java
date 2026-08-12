package com.faculynk.dto;

import jakarta.validation.constraints.NotBlank;

public class MatchingRequest {

    @NotBlank(message = "Task ID is required")
    private String taskId;

    public MatchingRequest() {
    }

    public MatchingRequest(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
}
