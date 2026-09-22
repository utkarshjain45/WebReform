package com.webreform.webopt.service;

import com.webreform.webopt.dto.*;
import java.util.List;

public interface ExperimentService {

    List<ExperimentSummaryDto> getAllExperiments();

    ExperimentDetailsDto getExperiment(Long id);

    ExperimentDetailsDto runExperimentSuite(CreateExperimentRequestDto request);

    String exportExperimentCsv(Long id);

    String exportExperimentJson(Long id);
}
