package com.faculynk.repository;

import com.faculynk.model.entity.Task;
import com.faculynk.model.enums.ResponsibilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByDepartmentId(String departmentId);

    List<Task> findByType(ResponsibilityType type);

    Optional<Task> findByCode(String code);

    List<Task> findByActive(boolean active);

    List<Task> findByDepartmentIdAndActive(String departmentId, boolean active);

    /**
     * Finds all tasks that do NOT currently have an ACTIVE task assignment.
     */
    @Query("SELECT t FROM Task t WHERE t.id NOT IN (SELECT ta.task.id FROM TaskAssignment ta WHERE ta.status = com.faculynk.model.enums.AssignmentStatus.ACTIVE)")
    List<Task> findUnassignedTasks();
}
