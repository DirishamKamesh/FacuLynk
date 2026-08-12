package com.faculynk.dto;

public class RecommendationItemResponse {

    private String id;
    private String taskId;
    private String taskTitle;
    private String taskCode;
    private int weeklyHours;
    
    private String sourceFacultyId;
    private String sourceFacultyName;
    private String targetFacultyId;
    private String targetFacultyName;
    private int suitabilityScore;
    
    private int sourceCurrentHours;
    private int sourceMaxHours;
    private int sourceProjectedHours;
    private String sourceCurrentStatus;
    private String sourceProjectedStatus;
    
    private int targetCurrentHours;
    private int targetMaxHours;
    private int targetProjectedHours;
    private String targetCurrentStatus;
    private String targetProjectedStatus;

    public RecommendationItemResponse() {
    }

    public RecommendationItemResponse(String id, String taskId, String taskTitle, String taskCode, int weeklyHours, String sourceFacultyId, String sourceFacultyName, String targetFacultyId, String targetFacultyName, int suitabilityScore, int sourceCurrentHours, int sourceMaxHours, int sourceProjectedHours, String sourceCurrentStatus, String sourceProjectedStatus, int targetCurrentHours, int targetMaxHours, int targetProjectedHours, String targetCurrentStatus, String targetProjectedStatus) {
        this.id = id;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.taskCode = taskCode;
        this.weeklyHours = weeklyHours;
        this.sourceFacultyId = sourceFacultyId;
        this.sourceFacultyName = sourceFacultyName;
        this.targetFacultyId = targetFacultyId;
        this.targetFacultyName = targetFacultyName;
        this.suitabilityScore = suitabilityScore;
        this.sourceCurrentHours = sourceCurrentHours;
        this.sourceMaxHours = sourceMaxHours;
        this.sourceProjectedHours = sourceProjectedHours;
        this.sourceCurrentStatus = sourceCurrentStatus;
        this.sourceProjectedStatus = sourceProjectedStatus;
        this.targetCurrentHours = targetCurrentHours;
        this.targetMaxHours = targetMaxHours;
        this.targetProjectedHours = targetProjectedHours;
        this.targetCurrentStatus = targetCurrentStatus;
        this.targetProjectedStatus = targetProjectedStatus;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public String getTaskCode() {
        return taskCode;
    }

    public void setTaskCode(String taskCode) {
        this.taskCode = taskCode;
    }

    public int getWeeklyHours() {
        return weeklyHours;
    }

    public void setWeeklyHours(int weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    public String getSourceFacultyId() {
        return sourceFacultyId;
    }

    public void setSourceFacultyId(String sourceFacultyId) {
        this.sourceFacultyId = sourceFacultyId;
    }

    public String getSourceFacultyName() {
        return sourceFacultyName;
    }

    public void setSourceFacultyName(String sourceFacultyName) {
        this.sourceFacultyName = sourceFacultyName;
    }

    public String getTargetFacultyId() {
        return targetFacultyId;
    }

    public void setTargetFacultyId(String targetFacultyId) {
        this.targetFacultyId = targetFacultyId;
    }

    public String getTargetFacultyName() {
        return targetFacultyName;
    }

    public void setTargetFacultyName(String targetFacultyName) {
        this.targetFacultyName = targetFacultyName;
    }

    public int getSuitabilityScore() {
        return suitabilityScore;
    }

    public void setSuitabilityScore(int suitabilityScore) {
        this.suitabilityScore = suitabilityScore;
    }

    public int getSourceCurrentHours() {
        return sourceCurrentHours;
    }

    public void setSourceCurrentHours(int sourceCurrentHours) {
        this.sourceCurrentHours = sourceCurrentHours;
    }

    public int getSourceMaxHours() {
        return sourceMaxHours;
    }

    public void setSourceMaxHours(int sourceMaxHours) {
        this.sourceMaxHours = sourceMaxHours;
    }

    public int getSourceProjectedHours() {
        return sourceProjectedHours;
    }

    public void setSourceProjectedHours(int sourceProjectedHours) {
        this.sourceProjectedHours = sourceProjectedHours;
    }

    public String getSourceCurrentStatus() {
        return sourceCurrentStatus;
    }

    public void setSourceCurrentStatus(String sourceCurrentStatus) {
        this.sourceCurrentStatus = sourceCurrentStatus;
    }

    public String getSourceProjectedStatus() {
        return sourceProjectedStatus;
    }

    public void setSourceProjectedStatus(String sourceProjectedStatus) {
        this.sourceProjectedStatus = sourceProjectedStatus;
    }

    public int getTargetCurrentHours() {
        return targetCurrentHours;
    }

    public void setTargetCurrentHours(int targetCurrentHours) {
        this.targetCurrentHours = targetCurrentHours;
    }

    public int getTargetMaxHours() {
        return targetMaxHours;
    }

    public void setTargetMaxHours(int targetMaxHours) {
        this.targetMaxHours = targetMaxHours;
    }

    public int getTargetProjectedHours() {
        return targetProjectedHours;
    }

    public void setTargetProjectedHours(int targetProjectedHours) {
        this.targetProjectedHours = targetProjectedHours;
    }

    public String getTargetCurrentStatus() {
        return targetCurrentStatus;
    }

    public void setTargetCurrentStatus(String targetCurrentStatus) {
        this.targetCurrentStatus = targetCurrentStatus;
    }

    public String getTargetProjectedStatus() {
        return targetProjectedStatus;
    }

    public void setTargetProjectedStatus(String targetProjectedStatus) {
        this.targetProjectedStatus = targetProjectedStatus;
    }
}
