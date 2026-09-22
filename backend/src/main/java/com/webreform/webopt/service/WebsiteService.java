package com.webreform.webopt.service;

import com.webreform.webopt.dto.CreateWebsiteRequestDto;
import com.webreform.webopt.dto.PageResponseDto;
import com.webreform.webopt.dto.WebsiteDetailResponseDto;
import com.webreform.webopt.dto.WebsiteResponseDto;

import java.util.List;

public interface WebsiteService {

    List<WebsiteResponseDto> getAllWebsites();

    WebsiteResponseDto createWebsite(CreateWebsiteRequestDto request);

    WebsiteDetailResponseDto getWebsiteById(Long id);

    List<PageResponseDto> getPagesByWebsiteId(Long websiteId);

    void deleteWebsite(Long id);
}
