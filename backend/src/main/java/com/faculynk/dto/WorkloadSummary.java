package com.faculynk.dto;

import java.util.Map;

public class WorkloadSummary {

    private String facultyId;
    private int currentHours;
    private int maxHours;
    private int utilizationPct;
    private int headroomHours;
    private int excessHours;
    private String status;
    private Map<String, Integer> breakdownByType;

    public WorkloadSummary() {
    }

    public WorkloadSummary(String facultyId, int currentHours, int maxHours, int utilizationPct, int headroomHours, int excessHours, String status, Map<String, Integer> breakdownByType) {
        this.facultyId = facultyId;
        this.currentHours = currentHours;
        this.maxHours = maxHours;
        this.utilizationPct = utilizationPct;
        this.headroomHours = headroomHours;
        this.excessHours = excessHours;
        this.status = status;
        this.breakdownByType = breakdownByType;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public int getCurrentHours() {
        return currentHours;
    }

    public void setCurrentHours(int currentHours) {
        this.currentHours = currentHours;
    }

    public int getMaxHours() {
        return maxHours;
    }

    public void setMaxHours(int maxHours) {
        this.maxHours = maxHours;
    }

    public int getUtilizationPct() {
        return utilizationPct;
    }

    public void setUtilizationPct(int utilizationPct) {
        this.utilizationPct = utilizationPct;
    }

    public int getHeadroomHours() {
        return headroomHours;
    }

    public void setHeadroomHours(int headroomHours) {
        this.headroomHours = headroomHours;
    }

    public int getExcessHours() {
        return excessHours;
    }

    public void setExcessHours(int excessHours) {
        this.excessHours = excessHours;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Integer> getBreakdownByType() {
        return breakdownByType;
    }

    public void setBreakdownByType(Map<String, Integer> breakdownByType) {
        this.breakdownByType = breakdownByType;
    }
}
