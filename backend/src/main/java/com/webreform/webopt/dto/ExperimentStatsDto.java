package com.webreform.webopt.dto;

public record ExperimentStatsDto(
        Double meanFitness,
        Double stdDevFitness,
        Double bestFitness,
        Double worstFitness,
        Double meanImprovementPercentage,
        Double meanExecutionTimeMs,
        Double stdDevExecutionTimeMs,
        Integer totalRunsCompleted
) {}
