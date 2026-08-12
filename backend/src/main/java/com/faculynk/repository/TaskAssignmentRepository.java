package com.faculynk.repository;

import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, String> {

    /**
     * CRITICAL WORKLOAD AGGREGATION QUERY:
     * Derives raw workload hours by summing weekly_hours of all ACTIVE task assignments for a faculty member.
     * Does NOT apply any business status rules (OVERLOADED / BALANCED / UNDERLOADED).
     */
    @Query("SELECT COALESCE(SUM(t.weeklyHours), 0) FROM TaskAssignment ta JOIN ta.task t WHERE ta.faculty.id = :facultyId AND ta.status = com.faculynk.model.enums.AssignmentStatus.ACTIVE")
    int calculateCurrentWorkloadHours(@Param("facultyId") String facultyId);

    List<TaskAssignment> findByFacultyIdAndStatus(String facultyId, AssignmentStatus status);

    List<TaskAssignment> findByFacultyId(String facultyId);

    Optional<TaskAssignment> findByTaskIdAndStatus(String taskId, AssignmentStatus status);

    boolean existsByTaskIdAndStatus(String taskId, AssignmentStatus status);

    List<TaskAssignment> findByFacultyDepartmentId(String departmentId);

    List<TaskAssignment> findByFacultyDepartmentIdAndStatus(String departmentId, AssignmentStatus status);

    List<TaskAssignment> findByTaskId(String taskId);
}
