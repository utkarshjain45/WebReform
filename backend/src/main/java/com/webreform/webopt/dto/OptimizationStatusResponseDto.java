package com.webreform.webopt.dto;

public record OptimizationStatusResponseDto(
        Long id,
        String status,
        Long executionTimeMs,
        String errorMessage
) {}
