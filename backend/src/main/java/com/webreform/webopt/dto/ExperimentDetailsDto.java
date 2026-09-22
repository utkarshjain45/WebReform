package com.webreform.webopt.dto;

import java.time.Instant;
import java.util.List;

public record ExperimentDetailsDto(
        Long id,
        String suiteType,
        String name,
        String description,
        Long websiteId,
        String websiteName,
        String status,
        ExperimentStatsDto stats,
        List<ExperimentRunDto> runs,
        Instant createdAt
) {}
