package com.faculynk.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class FacultyInterestId implements Serializable {

    @Column(name = "faculty_id", length = 36)
    private String facultyId;

    @Column(name = "interest", length = 255)
    private String interest;

    public FacultyInterestId() {
    }

    public FacultyInterestId(String facultyId, String interest) {
        this.facultyId = facultyId;
        this.interest = interest;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getInterest() {
        return interest;
    }

    public void setInterest(String interest) {
        this.interest = interest;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FacultyInterestId that = (FacultyInterestId) o;
        return Objects.equals(facultyId, that.facultyId) && Objects.equals(interest, that.interest);
    }

    @Override
    public int hashCode() {
        return Objects.hash(facultyId, interest);
    }
}
