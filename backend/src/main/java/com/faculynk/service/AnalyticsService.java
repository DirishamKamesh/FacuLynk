package com.faculynk.service;

import com.faculynk.dto.AnalyticsResponse;
import com.faculynk.dto.WorkloadSummary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    private final WorkloadService workloadService;

    public AnalyticsService(WorkloadService workloadService) {
        this.workloadService = workloadService;
    }

    public AnalyticsResponse getDepartmentAnalytics(String departmentId) {
        List<WorkloadSummary> summaries = workloadService.getDepartmentWorkloadMatrix(departmentId);

        int totalFaculty = summaries.size();
        int overloadedCount = 0;
        int underutilizedCount = 0;
        int optimalCount = 0;
        int totalDepartmentHours = 0;
        double sumUtilizationPct = 0;

        for (WorkloadSummary summary : summaries) {
            totalDepartmentHours += summary.getCurrentHours();
            sumUtilizationPct += summary.getUtilizationPct();

            switch (summary.getStatus()) {
                case "OVERLOADED":
                    overloadedCount++;
                    break;
                case "UNDERUTILIZED":
                    underutilizedCount++;
                    break;
                case "OPTIMAL":
                    optimalCount++;
                    break;
            }
        }

        int averageUtilizationPct = totalFaculty > 0 ? (int) Math.round(sumUtilizationPct / totalFaculty) : 0;

        AnalyticsResponse response = new AnalyticsResponse();
        response.setTotalFaculty(totalFaculty);
        response.setOverloadedCount(overloadedCount);
        response.setUnderutilizedCount(underutilizedCount);
        response.setOptimalCount(optimalCount);
        response.setTotalDepartmentHours(totalDepartmentHours);
        response.setAverageUtilizationPct(averageUtilizationPct);

        return response;
    }
}
