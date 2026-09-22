package com.webreform.webopt.controller;

import com.webreform.webopt.dto.*;
import com.webreform.webopt.service.OptimizationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/optimization", "/api/optimizations"})
public class OptimizationController {

    private final OptimizationService optimizationService;

    public OptimizationController(OptimizationService optimizationService) {
        this.optimizationService = optimizationService;
    }

    @GetMapping
    public ResponseEntity<List<OptimizationRunResponseDto>> getAllOptimizationRuns(
            @RequestParam(required = false) Long websiteId) {
        List<OptimizationRunResponseDto> runs = optimizationService.getAllOptimizationRuns(websiteId);
        return ResponseEntity.ok(runs);
    }

    @GetMapping("/latest")
    public ResponseEntity<OptimizationRunResponseDto> getLatestOptimizationRun(
            @RequestParam Long websiteId) {
        OptimizationRunResponseDto response = optimizationService.getLatestOptimizationRun(websiteId);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/run", ""})
    public ResponseEntity<OptimizationRunResponseDto> runOptimization(
            @Valid @RequestBody RunOptimizationRequestDto request) {
        OptimizationRunResponseDto response = optimizationService.runOptimization(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OptimizationRunResponseDto> getOptimizationRun(@PathVariable Long id) {
        OptimizationRunResponseDto response = optimizationService.getOptimizationRun(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<OptimizationStatusResponseDto> getOptimizationStatus(@PathVariable Long id) {
        OptimizationStatusResponseDto response = optimizationService.getOptimizationStatus(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<OptimizationResultResponseDto> getOptimizationResults(@PathVariable Long id) {
        OptimizationResultResponseDto response = optimizationService.getOptimizationResults(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/convergence")
    public ResponseEntity<OptimizationConvergenceResponseDto> getOptimizationConvergence(@PathVariable Long id) {
        OptimizationConvergenceResponseDto response = optimizationService.getOptimizationConvergence(id);
        return ResponseEntity.ok(response);
    }
}
