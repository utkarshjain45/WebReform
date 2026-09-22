package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "experiment_runs")
public class ExperimentRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @Column(name = "run_label", nullable = false, length = 128)
    private String runLabel;

    @Column(name = "param_name", nullable = false, length = 64)
    private String paramName;

    @Column(name = "param_value", nullable = false)
    private Double paramValue;

    @Column(name = "population_size", nullable = false)
    private Integer populationSize;

    @Column(nullable = false)
    private Integer iterations;

    @Column(name = "random_seed", nullable = false)
    private Integer randomSeed;

    @Column(name = "num_pages", nullable = false)
    private Integer numPages;

    @Column(name = "initial_fitness")
    private Double initialFitness;

    @Column(name = "final_fitness")
    private Double finalFitness;

    @Column(name = "improvement_percentage")
    private Double improvementPercentage;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "avg_depth")
    private Double avgDepth;

    @Column(name = "max_depth")
    private Integer maxDepth;

    @Column(name = "convergence_history", columnDefinition = "TEXT")
    private String convergenceHistory;

    @Column(name = "fitness_breakdown", columnDefinition = "TEXT")
    private String fitnessBreakdown;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ExperimentRun() {
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

    public Experiment getExperiment() {
        return experiment;
    }

    public void setExperiment(Experiment experiment) {
        this.experiment = experiment;
    }

    public String getRunLabel() {
        return runLabel;
    }

    public void setRunLabel(String runLabel) {
        this.runLabel = runLabel;
    }

    public String getParamName() {
        return paramName;
    }

    public void setParamName(String paramName) {
        this.paramName = paramName;
    }

    public Double getParamValue() {
        return paramValue;
    }

    public void setParamValue(Double paramValue) {
        this.paramValue = paramValue;
    }

    public Integer getPopulationSize() {
        return populationSize;
    }

    public void setPopulationSize(Integer populationSize) {
        this.populationSize = populationSize;
    }

    public Integer getIterations() {
        return iterations;
    }

    public void setIterations(Integer iterations) {
        this.iterations = iterations;
    }

    public Integer getRandomSeed() {
        return randomSeed;
    }

    public void setRandomSeed(Integer randomSeed) {
        this.randomSeed = randomSeed;
    }

    public Integer getNumPages() {
        return numPages;
    }

    public void setNumPages(Integer numPages) {
        this.numPages = numPages;
    }

    public Double getInitialFitness() {
        return initialFitness;
    }

    public void setInitialFitness(Double initialFitness) {
        this.initialFitness = initialFitness;
    }

    public Double getFinalFitness() {
        return finalFitness;
    }

    public void setFinalFitness(Double finalFitness) {
        this.finalFitness = finalFitness;
    }

    public Double getImprovementPercentage() {
        return improvementPercentage;
    }

    public void setImprovementPercentage(Double improvementPercentage) {
        this.improvementPercentage = improvementPercentage;
    }

    public Long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public Double getAvgDepth() {
        return avgDepth;
    }

    public void setAvgDepth(Double avgDepth) {
        this.avgDepth = avgDepth;
    }

    public Integer getMaxDepth() {
        return maxDepth;
    }

    public void setMaxDepth(Integer maxDepth) {
        this.maxDepth = maxDepth;
    }

    public String getConvergenceHistory() {
        return convergenceHistory;
    }

    public void setConvergenceHistory(String convergenceHistory) {
        this.convergenceHistory = convergenceHistory;
    }

    public String getFitnessBreakdown() {
        return fitnessBreakdown;
    }

    public void setFitnessBreakdown(String fitnessBreakdown) {
        this.fitnessBreakdown = fitnessBreakdown;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
