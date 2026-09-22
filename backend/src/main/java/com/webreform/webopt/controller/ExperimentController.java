package com.webreform.webopt.controller;

import com.webreform.webopt.dto.CreateExperimentRequestDto;
import com.webreform.webopt.dto.ExperimentDetailsDto;
import com.webreform.webopt.dto.ExperimentSummaryDto;
import com.webreform.webopt.service.ExperimentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments")
public class ExperimentController {

    private final ExperimentService experimentService;

    public ExperimentController(ExperimentService experimentService) {
        this.experimentService = experimentService;
    }

    @GetMapping
    public ResponseEntity<List<ExperimentSummaryDto>> getAllExperiments() {
        return ResponseEntity.ok(experimentService.getAllExperiments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperimentDetailsDto> getExperiment(@PathVariable Long id) {
        return ResponseEntity.ok(experimentService.getExperiment(id));
    }

    @PostMapping("/run")
    public ResponseEntity<ExperimentDetailsDto> runExperimentSuite(
            @Valid @RequestBody CreateExperimentRequestDto request) {
        ExperimentDetailsDto response = experimentService.runExperimentSuite(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/export/csv")
    public ResponseEntity<String> exportCsv(@PathVariable Long id) {
        String csv = experimentService.exportExperimentCsv(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"gwo_experiment_" + id + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/{id}/export/json")
    public ResponseEntity<String> exportJson(@PathVariable Long id) {
        String json = experimentService.exportExperimentJson(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"gwo_experiment_" + id + ".json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(json);
    }
}
