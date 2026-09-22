package com.webreform.webopt.dto;

import java.util.List;
import java.util.Map;

public record OptimizationResultResponseDto(
        Long id,
        Long websiteId,
        String status,
        Double initialFitness,
        Double finalFitness,
        Double improvementPercentage,
        Long executionTimeMs,
        List<OptimizedNodeDto> bestStructure,
        Map<String, Double> fitnessBreakdown,
        List<Double> convergence
) {

    public record OptimizedNodeDto(
            Long pageId,
            String url,
            String title,
            Long parentPageId,
            String parentUrl,
            Integer position,
            Integer depth
    ) {}
}
