package com.webreform.webopt.service;

import com.webreform.webopt.dto.*;
import java.util.List;

public interface OptimizationService {

    OptimizationRunResponseDto runOptimization(RunOptimizationRequestDto request);

    OptimizationRunResponseDto getOptimizationRun(Long id);

    OptimizationStatusResponseDto getOptimizationStatus(Long id);

    OptimizationResultResponseDto getOptimizationResults(Long id);

    List<OptimizationRunResponseDto> getAllOptimizationRuns(Long websiteId);

    OptimizationRunResponseDto getLatestOptimizationRun(Long websiteId);

    OptimizationConvergenceResponseDto getOptimizationConvergence(Long id);
}
