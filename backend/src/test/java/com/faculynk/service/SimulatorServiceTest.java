package com.faculynk.service;

import com.faculynk.dto.CandidateResponse;
import com.faculynk.dto.MatchingResponse;
import com.faculynk.dto.SimulationResultResponse;
import com.faculynk.dto.SimulatorRequest;
import com.faculynk.dto.TaskResponse;
import com.faculynk.dto.WorkloadSummary;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.model.enums.TaskPriority;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

public class SimulatorServiceTest {

    @Mock
    private FacultyProfileRepository facultyProfileRepository;

    @Mock
    private TaskAssignmentRepository taskAssignmentRepository;

    @Mock
    private MatchingEngine matchingEngine;

    @Mock
    private WorkloadService workloadService;

    @InjectMocks
    private SimulatorService simulatorService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testRunSimulation() {
        // Arrange
        String sourceId = "faculty-1";
        SimulatorRequest req = new SimulatorRequest();
        req.setFacultyId(sourceId);
        req.setDurationWeeks(2);

        FacultyProfile fp = new FacultyProfile();
        fp.setId(sourceId);
        when(facultyProfileRepository.findById(sourceId)).thenReturn(Optional.of(fp));

        Task task1 = new Task();
        task1.setId("task-1");
        task1.setWeeklyHours(10);
        task1.setType(ResponsibilityType.TEACHING);
        task1.setPriority(TaskPriority.HIGH);
        Department dept = new Department();
        dept.setCode("CS");
        task1.setDepartment(dept);

        TaskAssignment assign1 = new TaskAssignment();
        assign1.setTask(task1);

        when(taskAssignmentRepository.findByFacultyIdAndStatus(sourceId, AssignmentStatus.ACTIVE))
                .thenReturn(Collections.singletonList(assign1));

        MatchingResponse matchResponse = new MatchingResponse();
        CandidateResponse cand = new CandidateResponse();
        cand.setFacultyId("target-faculty-2");
        matchResponse.setCandidates(Collections.singletonList(cand));

        when(matchingEngine.calculateSuitability(eq("task-1"), eq(sourceId), anyMap()))
                .thenReturn(matchResponse);

        WorkloadSummary wsSource = new WorkloadSummary();
        wsSource.setFacultyId(sourceId);
        wsSource.setCurrentHours(0);
        
        WorkloadSummary wsTarget = new WorkloadSummary();
        wsTarget.setFacultyId("target-faculty-2");
        wsTarget.setCurrentHours(15);

        when(workloadService.calculateWorkload(eq(sourceId), anyMap())).thenReturn(wsSource);
        when(workloadService.calculateWorkload(eq("target-faculty-2"), anyMap())).thenReturn(wsTarget);

        // Act
        SimulationResultResponse res = simulatorService.runSimulation(req);

        // Assert
        assertNotNull(res);
        assertEquals(sourceId, res.getSimulatedFacultyId());
        assertEquals(1, res.getReassignedTasks().size());
        assertEquals(0, res.getUnassignedTasks().size());
        assertEquals(2, res.getProjectedWorkloads().size());
        
        assertEquals("task-1", res.getReassignedTasks().get(0).getTask().getId());
        assertEquals("target-faculty-2", res.getReassignedTasks().get(0).getTargetFaculty().getFacultyId());
    }
}
