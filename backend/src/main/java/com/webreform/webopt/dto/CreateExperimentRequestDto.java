package com.webreform.webopt.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateExperimentRequestDto(
        @NotBlank(message = "Suite type is required (POPULATION_SIZE, ITERATIONS, WEBSITE_SIZE, RANDOM_SEEDS)")
        String suiteType,

        Long websiteId,
        String name,
        String description,
        Integer basePopulationSize,
        Integer baseIterations,
        Integer baseSeed
) {}
