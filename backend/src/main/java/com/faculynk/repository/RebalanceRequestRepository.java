package com.faculynk.repository;

import com.faculynk.model.entity.RebalanceRequest;
import com.faculynk.model.enums.RebalanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RebalanceRequestRepository extends JpaRepository<RebalanceRequest, String> {

    List<RebalanceRequest> findByStatus(RebalanceStatus status);

    List<RebalanceRequest> findByRequesterFacultyId(String facultyId);

    List<RebalanceRequest> findByTargetOverloadedFacultyId(String facultyId);

    List<RebalanceRequest> findBySuggestedAssigneeFacultyId(String facultyId);
}
