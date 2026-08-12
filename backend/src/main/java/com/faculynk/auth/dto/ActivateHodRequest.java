package com.faculynk.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ActivateHodRequest {

    @NotBlank(message = "Institutional ID is required")
    private String hodId;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Department code or name is required")
    private String department;

    @NotBlank(message = "New password is required")
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    public ActivateHodRequest() {
    }

    public ActivateHodRequest(String hodId, String fullName, String email, String department, String password, String confirmPassword) {
        this.hodId = hodId;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    public String getHodId() {
        return hodId;
    }

    public void setHodId(String hodId) {
        this.hodId = hodId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
