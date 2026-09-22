package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "websites")
public class Website {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "base_url", nullable = false, unique = true, length = 1024)
    private String baseUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "website", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Page> pages = new ArrayList<>();

    @OneToMany(mappedBy = "website", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSession> userSessions = new ArrayList<>();

    @OneToMany(mappedBy = "website", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptimizationRun> optimizationRuns = new ArrayList<>();

    public Website() {
    }

    public Website(String name, String baseUrl) {
        this.name = name;
        this.baseUrl = baseUrl;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
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

    public List<Page> getPages() {
        return pages;
    }

    public void setPages(List<Page> pages) {
        this.pages = pages;
    }

    public List<UserSession> getUserSessions() {
        return userSessions;
    }

    public void setUserSessions(List<UserSession> userSessions) {
        this.userSessions = userSessions;
    }

    public List<OptimizationRun> getOptimizationRuns() {
        return optimizationRuns;
    }

    public void setOptimizationRuns(List<OptimizationRun> optimizationRuns) {
        this.optimizationRuns = optimizationRuns;
    }

    public void addPage(Page page) {
        pages.add(page);
        page.setWebsite(this);
    }

    public void removePage(Page page) {
        pages.remove(page);
        page.setWebsite(null);
    }

    @Override
    public String toString() {
        return "Website{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
