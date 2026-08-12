package com.faculynk.controller;

import com.faculynk.dto.SimulationResultResponse;
import com.faculynk.dto.SimulatorRequest;
import com.faculynk.service.SimulatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulator")
public class SimulatorController {

    private final SimulatorService simulatorService;

    public SimulatorController(SimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    @PostMapping("/run")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<SimulationResultResponse> runSimulation(@RequestBody SimulatorRequest request) {
        SimulationResultResponse response = simulatorService.runSimulation(request);
        return ResponseEntity.ok(response);
    }
}
