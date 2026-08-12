package com.faculynk.exception;

public class CapacityExceededException extends RuntimeException {
    private final String facultyId;
    private final int currentHours;
    private final int taskHours;
    private final int projectedHours;
    private final int maxHours;

    public CapacityExceededException(String facultyId, int currentHours, int taskHours, int projectedHours, int maxHours) {
        super(String.format("Capacity exceeded for faculty %s: current %d, task %d, projected %d, max %d",
                facultyId, currentHours, taskHours, projectedHours, maxHours));
        this.facultyId = facultyId;
        this.currentHours = currentHours;
        this.taskHours = taskHours;
        this.projectedHours = projectedHours;
        this.maxHours = maxHours;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public int getCurrentHours() {
        return currentHours;
    }

    public int getTaskHours() {
        return taskHours;
    }

    public int getProjectedHours() {
        return projectedHours;
    }

    public int getMaxHours() {
        return maxHours;
    }
}
