package com.faculynk.repository;

import com.faculynk.model.entity.FacultyRegistrationRequest;
import com.faculynk.model.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRegistrationRequestRepository extends JpaRepository<FacultyRegistrationRequest, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM FacultyRegistrationRequest r WHERE r.id = :id")
    Optional<FacultyRegistrationRequest> findAndLockById(@Param("id") String id);

    List<FacultyRegistrationRequest> findByStatus(RegistrationStatus status);

    Optional<FacultyRegistrationRequest> findByInstitutionalId(String institutionalId);

    Optional<FacultyRegistrationRequest> findByEmail(String email);

    List<FacultyRegistrationRequest> findByInstitutionalIdOrEmail(String institutionalId, String email);

    boolean existsByInstitutionalIdAndStatusIn(String institutionalId, Collection<RegistrationStatus> statuses);

    boolean existsByEmailAndStatusIn(String email, Collection<RegistrationStatus> statuses);
}
