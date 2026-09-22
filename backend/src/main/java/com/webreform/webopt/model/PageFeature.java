package com.webreform.webopt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "page_features")
public class PageFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false, unique = true)
    private Page page;

    @Column(name = "access_frequency")
    private Long accessFrequency = 0L;

    @Column(name = "unique_visitors")
    private Long uniqueVisitors = 0L;

    @Column(name = "average_duration")
    private Double averageDuration = 0.0;

    @Column(name = "backlink_count")
    private Integer backlinkCount = 0;

    @Column(name = "hub_score")
    private Double hubScore = 0.0;

    @Column(name = "authority_score")
    private Double authorityScore = 0.0;

    public PageFeature() {
    }

    public PageFeature(Page page) {
        this.page = page;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }

    public Long getAccessFrequency() {
        return accessFrequency;
    }

    public void setAccessFrequency(Long accessFrequency) {
        this.accessFrequency = accessFrequency;
    }

    public Long getUniqueVisitors() {
        return uniqueVisitors;
    }

    public void setUniqueVisitors(Long uniqueVisitors) {
        this.uniqueVisitors = uniqueVisitors;
    }

    public Double getAverageDuration() {
        return averageDuration;
    }

    public void setAverageDuration(Double averageDuration) {
        this.averageDuration = averageDuration;
    }

    public Integer getBacklinkCount() {
        return backlinkCount;
    }

    public void setBacklinkCount(Integer backlinkCount) {
        this.backlinkCount = backlinkCount;
    }

    public Double getHubScore() {
        return hubScore;
    }

    public void setHubScore(Double hubScore) {
        this.hubScore = hubScore;
    }

    public Double getAuthorityScore() {
        return authorityScore;
    }

    public void setAuthorityScore(Double authorityScore) {
        this.authorityScore = authorityScore;
    }

    @Override
    public String toString() {
        return "PageFeature{" +
                "id=" + id +
                ", pageId=" + (page != null ? page.getId() : null) +
                ", accessFrequency=" + accessFrequency +
                ", uniqueVisitors=" + uniqueVisitors +
                ", averageDuration=" + averageDuration +
                ", backlinkCount=" + backlinkCount +
                ", hubScore=" + hubScore +
                ", authorityScore=" + authorityScore +
                '}';
    }
}
