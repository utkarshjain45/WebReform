package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "optimization_runs")
public class OptimizationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false)
    private Website website;

    @Column(nullable = false, length = 64)
    private String algorithm = "WebReform";

    @Column(name = "population_size", nullable = false)
    private Integer populationSize;

    @Column(nullable = false)
    private Integer iterations;

    @Column(name = "initial_fitness")
    private Double initialFitness;

    @Column(name = "final_fitness")
    private Double finalFitness;

    @Column(name = "execution_time")
    private Long executionTime;

    @Column(nullable = false, length = 32)
    private String status = "PENDING";

    @Column(name = "random_seed")
    private Integer randomSeed;

    @Column(name = "max_depth")
    private Integer maxDepth;

    @Column(name = "max_children")
    private Integer maxChildren;

    @Column(name = "convergence_history", columnDefinition = "TEXT")
    private String convergenceHistory;

    @Column(name = "fitness_breakdown", columnDefinition = "TEXT")
    private String fitnessBreakdown;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "optimizationRun", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptimizedStructure> structures = new ArrayList<>();

    public OptimizationRun() {
    }

    public OptimizationRun(Website website, Integer populationSize, Integer iterations) {
        this.website = website;
        this.algorithm = "WebReform";
        this.populationSize = populationSize;
        this.iterations = iterations;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.algorithm == null) {
            this.algorithm = "WebReform";
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
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

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
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

    public Long getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(Long executionTime) {
        this.executionTime = executionTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<OptimizedStructure> getStructures() {
        return structures;
    }

    public void setStructures(List<OptimizedStructure> structures) {
        this.structures = structures;
    }

    public void addStructure(OptimizedStructure structure) {
        structures.add(structure);
        structure.setOptimizationRun(this);
    }

    public Integer getRandomSeed() {
        return randomSeed;
    }

    public void setRandomSeed(Integer randomSeed) {
        this.randomSeed = randomSeed;
    }

    public Integer getMaxDepth() {
        return maxDepth;
    }

    public void setMaxDepth(Integer maxDepth) {
        this.maxDepth = maxDepth;
    }

    public Integer getMaxChildren() {
        return maxChildren;
    }

    public void setMaxChildren(Integer maxChildren) {
        this.maxChildren = maxChildren;
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

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    @Override
    public String toString() {
        return "OptimizationRun{" +
                "id=" + id +
                ", algorithm='" + algorithm + '\'' +
                ", populationSize=" + populationSize +
                ", iterations=" + iterations +
                ", initialFitness=" + initialFitness +
                ", finalFitness=" + finalFitness +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
