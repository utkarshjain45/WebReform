package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "experiments")
public class Experiment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "suite_type", nullable = false, length = 64)
    private String suiteType;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id")
    private Website website;

    @Column(nullable = false, length = 32)
    private String status = "PENDING";

    @Column(name = "summary_metrics", columnDefinition = "TEXT")
    private String summaryMetrics;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "experiment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExperimentRun> runs = new ArrayList<>();

    public Experiment() {
    }

    public Experiment(String suiteType, String name, String description, Website website) {
        this.suiteType = suiteType;
        this.name = name;
        this.description = description;
        this.website = website;
        this.status = "PENDING";
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSuiteType() {
        return suiteType;
    }

    public void setSuiteType(String suiteType) {
        this.suiteType = suiteType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Website getWebsite() {
        return website;
    }

    public void setWebsite(Website website) {
        this.website = website;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSummaryMetrics() {
        return summaryMetrics;
    }

    public void setSummaryMetrics(String summaryMetrics) {
        this.summaryMetrics = summaryMetrics;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<ExperimentRun> getRuns() {
        return runs;
    }

    public void setRuns(List<ExperimentRun> runs) {
        this.runs = runs;
    }

    public void addRun(ExperimentRun run) {
        runs.add(run);
        run.setExperiment(this);
    }
}
