package com.webreform.webopt.service;

import com.webreform.webopt.dto.GraphAnalysisResponseDto;

public interface GraphAnalysisService {

    GraphAnalysisResponseDto analyzeWebsiteGraph(Long websiteId);
}
