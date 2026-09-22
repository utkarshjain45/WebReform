package com.webreform.webopt.dto;

import java.time.Instant;

public class WebsiteResponseDto {

    private Long id;
    private String name;
    private String baseUrl;
    private Instant createdAt;
    private long pageCount;

    public WebsiteResponseDto() {
    }

    public WebsiteResponseDto(Long id, String name, String baseUrl, Instant createdAt, long pageCount) {
        this.id = id;
        this.name = name;
        this.baseUrl = baseUrl;
        this.createdAt = createdAt;
        this.pageCount = pageCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public long getPageCount() {
        return pageCount;
    }

    public void setPageCount(long pageCount) {
        this.pageCount = pageCount;
    }
}
