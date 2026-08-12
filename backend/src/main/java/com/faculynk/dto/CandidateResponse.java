package com.faculynk.dto;

import java.util.List;

public class CandidateResponse {

    private String facultyId;
    private String facultyName;
    private String designation;
    private int currentHours;
    private int maxHours;
    private int headroomHours;
    private int projectedHours;
    private double skillScore;
    private double headroomScore;
    private double experienceScore;
    private double interestScore;
    private double finalScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String reason;
    private boolean eligible;

    public CandidateResponse() {
    }

    public CandidateResponse(String facultyId, String facultyName, String designation, int currentHours, int maxHours, int headroomHours, int projectedHours, double skillScore, double headroomScore, double experienceScore, double interestScore, double finalScore, List<String> matchedSkills, List<String> missingSkills, String reason, boolean eligible) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.designation = designation;
        this.currentHours = currentHours;
        this.maxHours = maxHours;
        this.headroomHours = headroomHours;
        this.projectedHours = projectedHours;
        this.skillScore = skillScore;
        this.headroomScore = headroomScore;
        this.experienceScore = experienceScore;
        this.interestScore = interestScore;
        this.finalScore = finalScore;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.reason = reason;
        this.eligible = eligible;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
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

    public int getHeadroomHours() {
        return headroomHours;
    }

    public void setHeadroomHours(int headroomHours) {
        this.headroomHours = headroomHours;
    }

    public int getProjectedHours() {
        return projectedHours;
    }

    public void setProjectedHours(int projectedHours) {
        this.projectedHours = projectedHours;
    }

    public double getSkillScore() {
        return skillScore;
    }

    public void setSkillScore(double skillScore) {
        this.skillScore = skillScore;
    }

    public double getHeadroomScore() {
        return headroomScore;
    }

    public void setHeadroomScore(double headroomScore) {
        this.headroomScore = headroomScore;
    }

    public double getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(double experienceScore) {
        this.experienceScore = experienceScore;
    }

    public double getInterestScore() {
        return interestScore;
    }

    public void setInterestScore(double interestScore) {
        this.interestScore = interestScore;
    }

    public double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(double finalScore) {
        this.finalScore = finalScore;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }
}
