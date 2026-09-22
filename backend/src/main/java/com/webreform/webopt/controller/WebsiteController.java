package com.webreform.webopt.controller;

import com.webreform.webopt.dto.*;
import com.webreform.webopt.service.CrawlerService;
import com.webreform.webopt.service.WebsiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/websites")
public class WebsiteController {

    private final WebsiteService websiteService;
    private final CrawlerService crawlerService;
    private final com.webreform.webopt.service.GraphAnalysisService graphAnalysisService;

    public WebsiteController(
            WebsiteService websiteService,
            CrawlerService crawlerService,
            com.webreform.webopt.service.GraphAnalysisService graphAnalysisService
    ) {
        this.websiteService = websiteService;
        this.crawlerService = crawlerService;
        this.graphAnalysisService = graphAnalysisService;
    }

    @GetMapping
    public ResponseEntity<List<WebsiteResponseDto>> getAllWebsites() {
        List<WebsiteResponseDto> websites = websiteService.getAllWebsites();
        return ResponseEntity.ok(websites);
    }

    @PostMapping
    public ResponseEntity<WebsiteResponseDto> createWebsite(
            @Valid @RequestBody CreateWebsiteRequestDto request) {
        WebsiteResponseDto created = websiteService.createWebsite(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebsiteDetailResponseDto> getWebsiteById(@PathVariable Long id) {
        WebsiteDetailResponseDto website = websiteService.getWebsiteById(id);
        return ResponseEntity.ok(website);
    }

    @GetMapping("/{id}/pages")
    public ResponseEntity<List<PageResponseDto>> getPagesByWebsiteId(@PathVariable Long id) {
        List<PageResponseDto> pages = websiteService.getPagesByWebsiteId(id);
        return ResponseEntity.ok(pages);
    }

    @PostMapping("/{id}/crawl")
    public ResponseEntity<CrawlJobResponseDto> startCrawl(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CrawlRequestDto request) {
        CrawlJobResponseDto response = crawlerService.initiateCrawl(id, request);
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/{id}/crawl/{jobId}")
    public ResponseEntity<CrawlJobResponseDto> getCrawlStatus(
            @PathVariable Long id,
            @PathVariable String jobId) {
        CrawlJobResponseDto response = crawlerService.getCrawlJobStatus(jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<GraphAnalysisResponseDto> getWebsiteGraphAnalysis(@PathVariable Long id) {
        GraphAnalysisResponseDto analysis = graphAnalysisService.analyzeWebsiteGraph(id);
        return ResponseEntity.ok(analysis);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebsite(@PathVariable Long id) {
        websiteService.deleteWebsite(id);
        return ResponseEntity.noContent().build();
    }
}
