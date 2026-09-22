package com.webreform.webopt.service;

import com.webreform.webopt.crawler.CrawlJobStatus;
import com.webreform.webopt.crawler.CrawlResult;
import com.webreform.webopt.crawler.WebsiteCrawler;
import com.webreform.webopt.dto.CrawlJobResponseDto;
import com.webreform.webopt.dto.CrawlRequestDto;
import com.webreform.webopt.exception.ResourceNotFoundException;
import com.webreform.webopt.model.Page;
import com.webreform.webopt.model.PageFeature;
import com.webreform.webopt.model.PageLink;
import com.webreform.webopt.model.Website;
import com.webreform.webopt.repository.PageFeatureRepository;
import com.webreform.webopt.repository.PageLinkRepository;
import com.webreform.webopt.repository.PageRepository;
import com.webreform.webopt.repository.WebsiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

@Service
public class CrawlerServiceImpl implements CrawlerService {

    private static final Logger log = LoggerFactory.getLogger(CrawlerServiceImpl.class);

    private final WebsiteRepository websiteRepository;
    private final PageRepository pageRepository;
    private final PageLinkRepository pageLinkRepository;
    private final PageFeatureRepository pageFeatureRepository;
    private final WebsiteCrawler websiteCrawler;

    private final ConcurrentMap<String, CrawlJobStatus> activeJobs = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);

    public CrawlerServiceImpl(
            WebsiteRepository websiteRepository,
            PageRepository pageRepository,
            PageLinkRepository pageLinkRepository,
            PageFeatureRepository pageFeatureRepository,
            WebsiteCrawler websiteCrawler) {
        this.websiteRepository = websiteRepository;
        this.pageRepository = pageRepository;
        this.pageLinkRepository = pageLinkRepository;
        this.pageFeatureRepository = pageFeatureRepository;
        this.websiteCrawler = websiteCrawler;
    }

    @Override
    public CrawlJobResponseDto initiateCrawl(Long websiteId, CrawlRequestDto request) {
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Website", "id", websiteId));

        String jobId = UUID.randomUUID().toString();
        CrawlJobStatus jobStatus = new CrawlJobStatus(jobId, websiteId);
        activeJobs.put(jobId, jobStatus);

        CrawlRequestDto config = request != null ? request : new CrawlRequestDto();

        // Launch crawl asynchronously
        executorService.submit(() -> runCrawlTask(website, config, jobStatus));

        return toResponseDto(jobStatus);
    }

    @Override
    public CrawlJobResponseDto getCrawlJobStatus(String jobId) {
        CrawlJobStatus jobStatus = activeJobs.get(jobId);
        if (jobStatus == null) {
            throw new ResourceNotFoundException("CrawlJob", "jobId", jobId);
        }
        return toResponseDto(jobStatus);
    }

    private void runCrawlTask(Website website, CrawlRequestDto request, CrawlJobStatus jobStatus) {
        jobStatus.setState(CrawlJobStatus.State.IN_PROGRESS);

        try {
            List<CrawlResult> crawlResults = websiteCrawler.crawlWebsite(
                    website.getBaseUrl(),
                    request.getMaxPages(),
                    request.getMaxDepth(),
                    jobStatus
            );

            // Persist discovered pages and links in database
            saveCrawlResults(website.getId(), crawlResults);

            jobStatus.setEndTime(Instant.now());
            jobStatus.setState(CrawlJobStatus.State.COMPLETED);
            log.info("Crawl job {} completed successfully for website {}", jobStatus.getJobId(), website.getId());
        } catch (Exception e) {
            log.error("Crawl job {} failed for website {}: {}", jobStatus.getJobId(), website.getId(), e.getMessage(), e);
            jobStatus.setEndTime(Instant.now());
            jobStatus.setState(CrawlJobStatus.State.FAILED);
            jobStatus.setErrorMessage(e.getMessage());
        }
    }

    @Transactional
    public void saveCrawlResults(Long websiteId, List<CrawlResult> crawlResults) {
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Website", "id", websiteId));

        Map<String, Page> pageMap = new HashMap<>();

        // 1. Save or update Page entities
        for (CrawlResult cr : crawlResults) {
            Optional<Page> existing = pageRepository.findByWebsiteIdAndUrl(websiteId, cr.getUrl());
            Page page;
            if (existing.isPresent()) {
                page = existing.get();
                page.setTitle(cr.getTitle());
                page.setContent(cr.getContent());
                page.setDepth(cr.getDepth());
                page.setLoadTime(cr.getLoadTimeMs());
            } else {
                page = new Page(website, cr.getUrl(), cr.getTitle());
                page.setContent(cr.getContent());
                page.setDepth(cr.getDepth());
                page.setLoadTime(cr.getLoadTimeMs());
            }

            Page savedPage = pageRepository.save(page);

            // Create initial PageFeature if missing
            if (!pageFeatureRepository.existsByPageId(savedPage.getId())) {
                PageFeature feature = new PageFeature(savedPage);
                pageFeatureRepository.save(feature);
            }

            pageMap.put(savedPage.getUrl(), savedPage);
        }

        // 2. Save PageLink directed edges
        for (CrawlResult cr : crawlResults) {
            Page source = pageMap.get(cr.getUrl());
            if (source == null) continue;

            for (String targetUrl : cr.getInternalLinks()) {
                Page target = pageMap.get(targetUrl);
                if (target != null && !target.getId().equals(source.getId())) {
                    if (!pageLinkRepository.existsBySourcePageIdAndTargetPageId(source.getId(), target.getId())) {
                        PageLink link = new PageLink(source, target);
                        pageLinkRepository.save(link);
                    }
                }
            }
        }
    }

    private CrawlJobResponseDto toResponseDto(CrawlJobStatus status) {
        return new CrawlJobResponseDto(
                status.getJobId(),
                status.getWebsiteId(),
                status.getState().name(),
                status.getPagesCrawled(),
                status.getLinksDiscovered(),
                status.getStartTime(),
                status.getEndTime(),
                status.getErrorMessage()
        );
    }
}
