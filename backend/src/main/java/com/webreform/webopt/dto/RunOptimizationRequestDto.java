package com.webreform.webopt.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RunOptimizationRequestDto(
        @NotNull(message = "Website ID is required")
        Long websiteId,

        @Min(value = 4, message = "Population size must be at least 4")
        @Max(value = 200, message = "Population size cannot exceed 200")
        Integer populationSize,

        @Min(value = 1, message = "Iterations must be at least 1")
        @Max(value = 500, message = "Iterations cannot exceed 500")
        Integer iterations,

        Integer randomSeed,

        @Min(value = 1, message = "Max depth must be at least 1")
        @Max(value = 10, message = "Max depth cannot exceed 10")
        Integer maxDepth,

        @Min(value = 1, message = "Max children must be at least 1")
        @Max(value = 30, message = "Max children cannot exceed 30")
        Integer maxChildren,

        @Valid
        FitnessWeightsDto weights
) {

    public record FitnessWeightsDto(
            Double navigation,
            Double behavior,
            Double structural,
            Double depth,
            Double semantic
    ) {
        public double getNavigationSafe() {
            return navigation != null ? navigation : 0.35;
        }

        public double getBehaviorSafe() {
            return behavior != null ? behavior : 0.25;
        }

        public double getStructuralSafe() {
            return structural != null ? structural : 0.20;
        }

        public double getDepthSafe() {
            return depth != null ? depth : 0.20;
        }

        public double getSemanticSafe() {
            return semantic != null ? semantic : 1.0;
        }
    }
}
