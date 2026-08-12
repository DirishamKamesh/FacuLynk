package com.faculynk.model.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "faculty_interests")
public class FacultyInterest {

    @EmbeddedId
    private FacultyInterestId id = new FacultyInterestId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("facultyId")
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyProfile facultyProfile;

    public FacultyInterest() {
    }

    public FacultyInterest(FacultyProfile facultyProfile, String interest) {
        this.facultyProfile = facultyProfile;
        String fId = facultyProfile != null ? facultyProfile.getId() : null;
        this.id = new FacultyInterestId(fId, interest);
    }

    public FacultyInterestId getId() {
        return id;
    }

    public void setId(FacultyInterestId id) {
        this.id = id;
    }

    public FacultyProfile getFacultyProfile() {
        return facultyProfile;
    }

    public void setFacultyProfile(FacultyProfile facultyProfile) {
        this.facultyProfile = facultyProfile;
        if (this.id == null) {
            this.id = new FacultyInterestId();
        }
        this.id.setFacultyId(facultyProfile != null ? facultyProfile.getId() : null);
    }

    public String getInterest() {
        return this.id != null ? this.id.getInterest() : null;
    }

    public void setInterest(String interest) {
        if (this.id == null) {
            this.id = new FacultyInterestId();
        }
        this.id.setInterest(interest);
    }
}
