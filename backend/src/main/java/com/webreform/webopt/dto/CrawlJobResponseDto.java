package com.webreform.webopt.dto;

import java.time.Instant;

public class CrawlJobResponseDto {

    private String jobId;
    private Long websiteId;
    private String status;
    private int pagesCrawled;
    private int linksDiscovered;
    private Instant startTime;
    private Instant endTime;
    private String errorMessage;

    public CrawlJobResponseDto() {
    }

    public CrawlJobResponseDto(String jobId, Long websiteId, String status, int pagesCrawled, int linksDiscovered, Instant startTime, Instant endTime, String errorMessage) {
        this.jobId = jobId;
        this.websiteId = websiteId;
        this.status = status;
        this.pagesCrawled = pagesCrawled;
        this.linksDiscovered = linksDiscovered;
        this.startTime = startTime;
        this.endTime = endTime;
        this.errorMessage = errorMessage;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public Long getWebsiteId() {
        return websiteId;
    }

    public void setWebsiteId(Long websiteId) {
        this.websiteId = websiteId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getPagesCrawled() {
        return pagesCrawled;
    }

    public void setPagesCrawled(int pagesCrawled) {
        this.pagesCrawled = pagesCrawled;
    }

    public int getLinksDiscovered() {
        return linksDiscovered;
    }

    public void setLinksDiscovered(int linksDiscovered) {
        this.linksDiscovered = linksDiscovered;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
