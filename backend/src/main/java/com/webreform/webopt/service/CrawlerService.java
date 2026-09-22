package com.webreform.webopt.service;

import com.webreform.webopt.dto.CrawlJobResponseDto;
import com.webreform.webopt.dto.CrawlRequestDto;

public interface CrawlerService {

    CrawlJobResponseDto initiateCrawl(Long websiteId, CrawlRequestDto request);

    CrawlJobResponseDto getCrawlJobStatus(String jobId);
}
