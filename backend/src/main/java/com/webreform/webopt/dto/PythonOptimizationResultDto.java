package com.webreform.webopt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record PythonOptimizationResultDto(
        @JsonProperty("bestStructure")
        BestStructureDto bestStructure,

        Double initialFitness,
        Double finalFitness,
        Double improvementPercentage,
        List<Double> convergence,
        Integer iterations,
        Double executionTime,

        @JsonProperty("fitnessBreakdown")
        Map<String, Double> fitnessBreakdown
) {

    public record BestStructureDto(
            int numPages,
            Map<String, Long> parents,
            Map<String, Integer> positions,
            Map<String, Integer> depths,
            List<List<Long>> edges
    ) {}
}
