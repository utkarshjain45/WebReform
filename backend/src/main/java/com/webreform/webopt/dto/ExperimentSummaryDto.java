package com.webreform.webopt.dto;

import java.time.Instant;

public record ExperimentSummaryDto(
        Long id,
        String suiteType,
        String name,
        String description,
        Long websiteId,
        String websiteName,
        String status,
        Integer totalRuns,
        Double bestFitness,
        Double meanFitness,
        Double meanImprovementPercentage,
        Double meanExecutionTimeMs,
        Instant createdAt
) {}
