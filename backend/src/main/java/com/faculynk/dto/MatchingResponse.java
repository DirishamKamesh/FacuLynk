package com.faculynk.dto;

import java.util.List;

public class MatchingResponse {

    private TaskResponse task;
    private List<CandidateResponse> candidates;
    private List<ExcludedCandidateResponse> excludedCandidates;

    public MatchingResponse() {
    }

    public MatchingResponse(TaskResponse task, List<CandidateResponse> candidates, List<ExcludedCandidateResponse> excludedCandidates) {
        this.task = task;
        this.candidates = candidates;
        this.excludedCandidates = excludedCandidates;
    }

    public TaskResponse getTask() {
        return task;
    }

    public void setTask(TaskResponse task) {
        this.task = task;
    }

    public List<CandidateResponse> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<CandidateResponse> candidates) {
        this.candidates = candidates;
    }

    public List<ExcludedCandidateResponse> getExcludedCandidates() {
        return excludedCandidates;
    }

    public void setExcludedCandidates(List<ExcludedCandidateResponse> excludedCandidates) {
        this.excludedCandidates = excludedCandidates;
    }
}
