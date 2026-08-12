package com.faculynk.service;

import org.springframework.stereotype.Component;

@Component
public class WorkloadCalculator {

    public String calculateStatus(int currentHours, int maxHours) {
        if (maxHours <= 0) {
            return "UNDERLOADED";
        }
        if (currentHours > maxHours) {
            return "OVERLOADED";
        }
        double ratio = (double) currentHours / maxHours;
        if (ratio >= 0.80) {
            return "BALANCED";
        } else {
            return "UNDERLOADED";
        }
    }

    public int calculateUtilization(int currentHours, int maxHours) {
        if (maxHours <= 0) {
            return 0;
        }
        return (int) Math.round((double) currentHours * 100.0 / maxHours);
    }

    public int calculateHeadroom(int currentHours, int maxHours) {
        return Math.max(0, maxHours - currentHours);
    }

    public int calculateExcess(int currentHours, int maxHours) {
        return Math.max(0, currentHours - maxHours);
    }
}
