package com.webreform.webopt.dto;

import java.time.Instant;

public record OptimizationRunResponseDto(
        Long id,
        Long websiteId,
        String algorithm,
        Integer populationSize,
        Integer iterations,
        Integer randomSeed,
        Integer maxDepth,
        Integer maxChildren,
        Double initialFitness,
        Double finalFitness,
        Long executionTimeMs,
        String status,
        String errorMessage,
        Instant createdAt
) {}
