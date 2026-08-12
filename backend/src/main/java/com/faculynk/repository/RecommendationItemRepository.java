package com.faculynk.repository;

import com.faculynk.model.entity.RecommendationItem;
import com.faculynk.model.enums.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationItemRepository extends JpaRepository<RecommendationItem, String> {

    List<RecommendationItem> findByRecommendationId(String recommendationId);

    List<RecommendationItem> findByTargetFacultyIdAndStatus(String facultyId, RecommendationStatus status);

    List<RecommendationItem> findByStatus(RecommendationStatus status);
}
