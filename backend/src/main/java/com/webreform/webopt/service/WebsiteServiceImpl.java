package com.webreform.webopt.service;

import com.webreform.webopt.dto.CreateWebsiteRequestDto;
import com.webreform.webopt.dto.PageResponseDto;
import com.webreform.webopt.dto.WebsiteDetailResponseDto;
import com.webreform.webopt.dto.WebsiteResponseDto;
import com.webreform.webopt.exception.DuplicateResourceException;
import com.webreform.webopt.exception.ResourceNotFoundException;
import com.webreform.webopt.model.Page;
import com.webreform.webopt.model.Website;
import com.webreform.webopt.repository.PageRepository;
import com.webreform.webopt.repository.WebsiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WebsiteServiceImpl implements WebsiteService {

    private final WebsiteRepository websiteRepository;
    private final PageRepository pageRepository;

    public WebsiteServiceImpl(WebsiteRepository websiteRepository, PageRepository pageRepository) {
        this.websiteRepository = websiteRepository;
        this.pageRepository = pageRepository;
    }

    @Override
    public List<WebsiteResponseDto> getAllWebsites() {
        return websiteRepository.findAll().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WebsiteResponseDto createWebsite(CreateWebsiteRequestDto request) {
        String normalizedUrl = normalizeBaseUrl(request.getBaseUrl());

        if (websiteRepository.existsByBaseUrl(normalizedUrl)) {
            throw new DuplicateResourceException(
                    "A website with baseUrl '" + normalizedUrl + "' already exists."
            );
        }

        Website website = new Website(request.getName().trim(), normalizedUrl);
        Website saved = websiteRepository.save(website);
        return mapToSummaryDto(saved);
    }

    @Override
    public WebsiteDetailResponseDto getWebsiteById(Long id) {
        Website website = websiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Website", "id", id));

        List<Page> pages = pageRepository.findByWebsiteIdOrderByDepthAsc(id);
        List<PageResponseDto> pageDtos = pages.stream()
                .map(this::mapToPageDto)
                .collect(Collectors.toList());

        return new WebsiteDetailResponseDto(
                website.getId(),
                website.getName(),
                website.getBaseUrl(),
                website.getCreatedAt(),
                pages.size(),
                pageDtos
        );
    }

    @Override
    public List<PageResponseDto> getPagesByWebsiteId(Long websiteId) {
        if (!websiteRepository.existsById(websiteId)) {
            throw new ResourceNotFoundException("Website", "id", websiteId);
        }

        return pageRepository.findByWebsiteIdOrderByDepthAsc(websiteId).stream()
                .map(this::mapToPageDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteWebsite(Long id) {
        if (!websiteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Website", "id", id);
        }
        websiteRepository.deleteById(id);
    }

    private WebsiteResponseDto mapToSummaryDto(Website website) {
        long count = pageRepository.countByWebsiteId(website.getId());
        return new WebsiteResponseDto(
                website.getId(),
                website.getName(),
                website.getBaseUrl(),
                website.getCreatedAt(),
                count
        );
    }

    private PageResponseDto mapToPageDto(Page page) {
        return new PageResponseDto(
                page.getId(),
                page.getWebsite().getId(),
                page.getUrl(),
                page.getTitle(),
                page.getDepth(),
                page.getLoadTime()
        );
    }

    private String normalizeBaseUrl(String url) {
        if (url == null) return null;
        String trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://" + trimmed;
        }
        if (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
