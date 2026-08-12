package com.faculynk.dto;

public class AnalyticsResponse {
    private int totalFaculty;
    private int overloadedCount;
    private int underutilizedCount;
    private int optimalCount;
    private int totalDepartmentHours;
    private int averageUtilizationPct;

    public AnalyticsResponse() {}

    public int getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(int totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public int getOverloadedCount() {
        return overloadedCount;
    }

    public void setOverloadedCount(int overloadedCount) {
        this.overloadedCount = overloadedCount;
    }

    public int getUnderutilizedCount() {
        return underutilizedCount;
    }

    public void setUnderutilizedCount(int underutilizedCount) {
        this.underutilizedCount = underutilizedCount;
    }

    public int getOptimalCount() {
        return optimalCount;
    }

    public void setOptimalCount(int optimalCount) {
        this.optimalCount = optimalCount;
    }

    public int getTotalDepartmentHours() {
        return totalDepartmentHours;
    }

    public void setTotalDepartmentHours(int totalDepartmentHours) {
        this.totalDepartmentHours = totalDepartmentHours;
    }

    public int getAverageUtilizationPct() {
        return averageUtilizationPct;
    }

    public void setAverageUtilizationPct(int averageUtilizationPct) {
        this.averageUtilizationPct = averageUtilizationPct;
    }
}
