package com.faculynk.dto;

import java.util.List;

public class FacultyResponse {

    private String id;
    private String name;
    private String email;
    private String designation;
    private String department;
    private int maxWorkloadHours;
    private int currentWorkloadHours;
    private int utilizationPct;
    private int headroomHours;
    private int excessHours;
    private String status;
    private List<String> skills;
    private List<String> interests;
    private int experience;
    private String accountStatus;

    public FacultyResponse() {
    }

    public FacultyResponse(String id, String name, String email, String designation, String department, int maxWorkloadHours, int currentWorkloadHours, int utilizationPct, int headroomHours, int excessHours, String status, List<String> skills, List<String> interests, int experience, String accountStatus) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.designation = designation;
        this.department = department;
        this.maxWorkloadHours = maxWorkloadHours;
        this.currentWorkloadHours = currentWorkloadHours;
        this.utilizationPct = utilizationPct;
        this.headroomHours = headroomHours;
        this.excessHours = excessHours;
        this.status = status;
        this.skills = skills;
        this.interests = interests;
        this.experience = experience;
        this.accountStatus = accountStatus;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getMaxWorkloadHours() {
        return maxWorkloadHours;
    }

    public void setMaxWorkloadHours(int maxWorkloadHours) {
        this.maxWorkloadHours = maxWorkloadHours;
    }

    public int getCurrentWorkloadHours() {
        return currentWorkloadHours;
    }

    public void setCurrentWorkloadHours(int currentWorkloadHours) {
        this.currentWorkloadHours = currentWorkloadHours;
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

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public int getExperience() {
        return experience;
    }

    public void setExperience(int experience) {
        this.experience = experience;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }
}
