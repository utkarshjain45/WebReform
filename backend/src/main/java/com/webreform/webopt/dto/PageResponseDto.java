package com.webreform.webopt.dto;

public class PageResponseDto {

    private Long id;
    private Long websiteId;
    private String url;
    private String title;
    private Integer depth;
    private Double loadTime;

    public PageResponseDto() {
    }

    public PageResponseDto(Long id, Long websiteId, String url, String title, Integer depth, Double loadTime) {
        this.id = id;
        this.websiteId = websiteId;
        this.url = url;
        this.title = title;
        this.depth = depth;
        this.loadTime = loadTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWebsiteId() {
        return websiteId;
    }

    public void setWebsiteId(Long websiteId) {
        this.websiteId = websiteId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getDepth() {
        return depth;
    }

    public void setDepth(Integer depth) {
        this.depth = depth;
    }

    public Double getLoadTime() {
        return loadTime;
    }

    public void setLoadTime(Double loadTime) {
        this.loadTime = loadTime;
    }
}
