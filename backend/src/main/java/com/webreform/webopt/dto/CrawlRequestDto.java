package com.webreform.webopt.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class CrawlRequestDto {

    @Min(value = 1, message = "maxPages must be at least 1")
    @Max(value = 200, message = "maxPages must not exceed 200")
    private Integer maxPages = 30;

    @Min(value = 0, message = "maxDepth must be 0 or greater")
    @Max(value = 10, message = "maxDepth must not exceed 10")
    private Integer maxDepth = 3;

    public CrawlRequestDto() {
    }

    public CrawlRequestDto(Integer maxPages, Integer maxDepth) {
        if (maxPages != null) {
            this.maxPages = maxPages;
        }
        if (maxDepth != null) {
            this.maxDepth = maxDepth;
        }
    }

    public Integer getMaxPages() {
        return maxPages != null ? maxPages : 30;
    }

    public void setMaxPages(Integer maxPages) {
        this.maxPages = maxPages;
    }

    public Integer getMaxDepth() {
        return maxDepth != null ? maxDepth : 3;
    }

    public void setMaxDepth(Integer maxDepth) {
        this.maxDepth = maxDepth;
    }
}
