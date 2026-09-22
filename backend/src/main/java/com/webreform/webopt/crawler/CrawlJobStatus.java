package com.webreform.webopt.crawler;

import java.time.Instant;

public class CrawlJobStatus {

    public enum State {
        SUBMITTED,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    private final String jobId;
    private final Long websiteId;
    private volatile State state;
    private volatile int pagesCrawled = 0;
    private volatile int linksDiscovered = 0;
    private final Instant startTime;
    private volatile Instant endTime;
    private volatile String errorMessage;

    public CrawlJobStatus(String jobId, Long websiteId) {
        this.jobId = jobId;
        this.websiteId = websiteId;
        this.state = State.SUBMITTED;
        this.startTime = Instant.now();
    }

    public String getJobId() {
        return jobId;
    }

    public Long getWebsiteId() {
        return websiteId;
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
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
