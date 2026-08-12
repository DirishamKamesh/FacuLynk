package com.faculynk;

import com.faculynk.service.WorkloadCalculator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WorkloadCalculatorTests {

    private final WorkloadCalculator calculator = new WorkloadCalculator();

    @Test
    @DisplayName("Workload boundary tests for Professor (cap=10)")
    void testProfessorWorkloadBoundaries() {
        assertEquals("UNDERLOADED", calculator.calculateStatus(7, 10));
        assertEquals("BALANCED", calculator.calculateStatus(8, 10));
        assertEquals("BALANCED", calculator.calculateStatus(9, 10));
        assertEquals("BALANCED", calculator.calculateStatus(10, 10));
        assertEquals("OVERLOADED", calculator.calculateStatus(11, 10));
    }

    @Test
    @DisplayName("Workload boundary tests for Associate Professor (cap=16)")
    void testAssociateWorkloadBoundaries() {
        assertEquals("UNDERLOADED", calculator.calculateStatus(12, 16));
        assertEquals("BALANCED", calculator.calculateStatus(13, 16));
        assertEquals("BALANCED", calculator.calculateStatus(14, 16));
        assertEquals("BALANCED", calculator.calculateStatus(16, 16));
        assertEquals("OVERLOADED", calculator.calculateStatus(17, 16));
    }

    @Test
    @DisplayName("Workload boundary tests for Assistant Professor (cap=20)")
    void testAssistantWorkloadBoundaries() {
        assertEquals("UNDERLOADED", calculator.calculateStatus(15, 20));
        assertEquals("BALANCED", calculator.calculateStatus(16, 20));
        assertEquals("BALANCED", calculator.calculateStatus(19, 20));
        assertEquals("BALANCED", calculator.calculateStatus(20, 20));
        assertEquals("OVERLOADED", calculator.calculateStatus(21, 20));
    }
}
