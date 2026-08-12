package com.faculynk.repository;

import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.enums.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, String> {

    Optional<FacultyProfile> findByUserId(String userId);

    Optional<FacultyProfile> findByUserInstitutionalId(String institutionalId);

    List<FacultyProfile> findByDepartmentId(String departmentId);

    List<FacultyProfile> findByDepartmentCode(String departmentCode);

    List<FacultyProfile> findByDesignation(Designation designation);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT f FROM FacultyProfile f WHERE f.id = :id")
    Optional<FacultyProfile> findAndLockById(@org.springframework.data.repository.query.Param("id") String id);
}
