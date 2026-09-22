package com.webreform.webopt.dto;

import java.util.List;

public record OptimizationConvergenceResponseDto(
        Long id,
        Integer iterations,
        List<Double> convergence
) {}
