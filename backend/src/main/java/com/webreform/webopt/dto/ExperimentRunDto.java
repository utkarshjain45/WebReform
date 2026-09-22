package com.webreform.webopt.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ExperimentRunDto(
        Long id,
        Long experimentId,
        String runLabel,
        String paramName,
        Double paramValue,
        Integer populationSize,
        Integer iterations,
        Integer randomSeed,
        Integer numPages,
        Double initialFitness,
        Double finalFitness,
        Double improvementPercentage,
        Long executionTimeMs,
        Double avgDepth,
        Integer maxDepth,
        List<Double> convergence,
        Map<String, Double> fitnessBreakdown,
        Instant createdAt
) {}
