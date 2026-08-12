package com.faculynk.repository;

import com.faculynk.model.entity.Recommendation;
import com.faculynk.model.enums.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, String> {

    List<Recommendation> findByStatus(RecommendationStatus status);

    List<Recommendation> findByOverloadedFacultyIdAndStatus(String facultyId, RecommendationStatus status);

    List<Recommendation> findByOverloadedFacultyId(String facultyId);
}
