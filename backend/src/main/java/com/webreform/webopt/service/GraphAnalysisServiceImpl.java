package com.webreform.webopt.service;

import com.webreform.webopt.dto.GraphAnalysisResponseDto;
import com.webreform.webopt.exception.ResourceNotFoundException;
import com.webreform.webopt.model.Page;
import com.webreform.webopt.model.PageLink;
import com.webreform.webopt.repository.PageLinkRepository;
import com.webreform.webopt.repository.PageRepository;
import com.webreform.webopt.repository.WebsiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GraphAnalysisServiceImpl implements GraphAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(GraphAnalysisServiceImpl.class);

    private final WebsiteRepository websiteRepository;
    private final PageRepository pageRepository;
    private final PageLinkRepository pageLinkRepository;
    private final RestClient restClient;
    private final String optimizerServiceUrl;

    public GraphAnalysisServiceImpl(
            WebsiteRepository websiteRepository,
            PageRepository pageRepository,
            PageLinkRepository pageLinkRepository,
            RestClient.Builder restClientBuilder,
            @Value("${optimizer.service.url:http://localhost:8000}") String optimizerServiceUrl
    ) {
        this.websiteRepository = websiteRepository;
        this.pageRepository = pageRepository;
        this.pageLinkRepository = pageLinkRepository;
        this.optimizerServiceUrl = optimizerServiceUrl;
        this.restClient = restClientBuilder.baseUrl(optimizerServiceUrl).build();
    }

    @Override
    @Transactional(readOnly = true)
    public GraphAnalysisResponseDto analyzeWebsiteGraph(Long websiteId) {
        if (!websiteRepository.existsById(websiteId)) {
            throw new ResourceNotFoundException("Website", "id", websiteId);
        }

        List<Page> pages = pageRepository.findByWebsiteId(websiteId);
        if (pages.isEmpty()) {
            throw new IllegalArgumentException("Cannot perform graph analysis: website " + websiteId + " has no crawled pages.");
        }

        List<PageLink> links = pageLinkRepository.findAllByWebsiteId(websiteId);
        log.info("Constructing graph analysis request for website {}: {} pages, {} links", websiteId, pages.size(), links.size());

        List<Map<String, Object>> pagesPayload = pages.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("url", p.getUrl());
            map.put("title", p.getTitle());
            map.put("depth", p.getDepth());
            map.put("access_frequency", 1.0);
            return map;
        }).toList();

        List<Map<String, Object>> linksPayload = links.stream().map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("source_page_id", l.getSourcePage().getId());
            map.put("target_page_id", l.getTargetPage().getId());
            return map;
        }).toList();

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("pages", pagesPayload);
        requestPayload.put("links", linksPayload);

        // Call FastAPI optimizer service at /graph/analyze
        try {
            return restClient.post()
                    .uri("/graph/analyze")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .body(GraphAnalysisResponseDto.class);
        } catch (Exception ex) {
            log.error("Failed to execute graph analysis via optimizer service at {}: {}", optimizerServiceUrl, ex.getMessage());
            throw new IllegalStateException("Optimizer service graph analysis failed: " + ex.getMessage(), ex);
        }
    }
}
