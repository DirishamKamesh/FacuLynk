package com.faculynk.service;

import com.faculynk.dto.AnalyticsResponse;
import com.faculynk.dto.WorkloadSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class AnalyticsServiceTest {

    @Mock
    private WorkloadService workloadService;

    @InjectMocks
    private AnalyticsService analyticsService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetDepartmentAnalytics() {
        // Arrange
        String deptId = "CS";

        WorkloadSummary ws1 = new WorkloadSummary();
        ws1.setCurrentHours(18);
        ws1.setUtilizationPct(90);
        ws1.setStatus("OPTIMAL");

        WorkloadSummary ws2 = new WorkloadSummary();
        ws2.setCurrentHours(25);
        ws2.setUtilizationPct(125);
        ws2.setStatus("OVERLOADED");

        WorkloadSummary ws3 = new WorkloadSummary();
        ws3.setCurrentHours(5);
        ws3.setUtilizationPct(25);
        ws3.setStatus("UNDERUTILIZED");

        when(workloadService.getDepartmentWorkloadMatrix(deptId))
                .thenReturn(Arrays.asList(ws1, ws2, ws3));

        // Act
        AnalyticsResponse response = analyticsService.getDepartmentAnalytics(deptId);

        // Assert
        assertEquals(3, response.getTotalFaculty());
        assertEquals(1, response.getOptimalCount());
        assertEquals(1, response.getOverloadedCount());
        assertEquals(1, response.getUnderutilizedCount());
        assertEquals(48, response.getTotalDepartmentHours());
        assertEquals(80, response.getAverageUtilizationPct());
    }
}
