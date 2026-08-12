package com.faculynk.dto;

import java.time.LocalDate;
import java.util.List;

public class TaskResponse {

    private String id;
    private String title;
    private String code;
    private String type;
    private int weeklyHours;
    private String priority;
    private String departmentCode;
    private String semester;
    private LocalDate deadline;
    private String description;
    private List<String> requiredSkills;
    private boolean active;
    private String assignedToFacultyId;
    private String assignedToFacultyName;

    public TaskResponse() {
    }

    public TaskResponse(String id, String title, String code, String type, int weeklyHours, String priority, String departmentCode, String semester, LocalDate deadline, String description, List<String> requiredSkills, boolean active, String assignedToFacultyId, String assignedToFacultyName) {
        this.id = id;
        this.title = title;
        this.code = code;
        this.type = type;
        this.weeklyHours = weeklyHours;
        this.priority = priority;
        this.departmentCode = departmentCode;
        this.semester = semester;
        this.deadline = deadline;
        this.description = description;
        this.requiredSkills = requiredSkills;
        this.active = active;
        this.assignedToFacultyId = assignedToFacultyId;
        this.assignedToFacultyName = assignedToFacultyName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getWeeklyHours() {
        return weeklyHours;
    }

    public void setWeeklyHours(int weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAssignedToFacultyId() {
        return assignedToFacultyId;
    }

    public void setAssignedToFacultyId(String assignedToFacultyId) {
        this.assignedToFacultyId = assignedToFacultyId;
    }

    public String getAssignedToFacultyName() {
        return assignedToFacultyName;
    }

    public void setAssignedToFacultyName(String assignedToFacultyName) {
        this.assignedToFacultyName = assignedToFacultyName;
    }
}
