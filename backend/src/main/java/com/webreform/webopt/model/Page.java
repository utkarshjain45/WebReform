package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pages", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pages_website_url", columnNames = {"website_id", "url"})
})
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false)
    private Website website;

    @Column(nullable = false, length = 2048)
    private String url;

    @Column(length = 512)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column
    private Integer depth = 0;

    @Column(name = "load_time")
    private Double loadTime;

    @OneToOne(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PageFeature feature;

    @OneToMany(mappedBy = "sourcePage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PageLink> outgoingLinks = new ArrayList<>();

    @OneToMany(mappedBy = "targetPage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PageLink> incomingLinks = new ArrayList<>();

    public Page() {
    }

    public Page(Website website, String url, String title) {
        this.website = website;
        this.url = url;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Website getWebsite() {
        return website;
    }

    public void setWebsite(Website website) {
        this.website = website;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public PageFeature getFeature() {
        return feature;
    }

    public void setFeature(PageFeature feature) {
        this.feature = feature;
        if (feature != null) {
            feature.setPage(this);
        }
    }

    public List<PageLink> getOutgoingLinks() {
        return outgoingLinks;
    }

    public void setOutgoingLinks(List<PageLink> outgoingLinks) {
        this.outgoingLinks = outgoingLinks;
    }

    public List<PageLink> getIncomingLinks() {
        return incomingLinks;
    }

    public void setIncomingLinks(List<PageLink> incomingLinks) {
        this.incomingLinks = incomingLinks;
    }

    @Override
    public String toString() {
        return "Page{" +
                "id=" + id +
                ", url='" + url + '\'' +
                ", title='" + title + '\'' +
                ", depth=" + depth +
                ", loadTime=" + loadTime +
                '}';
    }
}
