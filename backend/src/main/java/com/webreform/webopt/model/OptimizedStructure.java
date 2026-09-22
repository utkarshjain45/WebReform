package com.webreform.webopt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "optimized_structures", uniqueConstraints = {
    @UniqueConstraint(name = "uk_optimized_structures_run_page", columnNames = {"optimization_run_id", "page_id"})
})
public class OptimizedStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "optimization_run_id", nullable = false)
    private OptimizationRun optimizationRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private Page page;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_page_id")
    private Page parentPage;

    @Column
    private Integer position = 0;

    public OptimizedStructure() {
    }

    public OptimizedStructure(OptimizationRun optimizationRun, Page page, Page parentPage, Integer position) {
        this.optimizationRun = optimizationRun;
        this.page = page;
        this.parentPage = parentPage;
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OptimizationRun getOptimizationRun() {
        return optimizationRun;
    }

    public void setOptimizationRun(OptimizationRun optimizationRun) {
        this.optimizationRun = optimizationRun;
    }

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }

    public Page getParentPage() {
        return parentPage;
    }

    public void setParentPage(Page parentPage) {
        this.parentPage = parentPage;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    @Override
    public String toString() {
        return "OptimizedStructure{" +
                "id=" + id +
                ", optimizationRunId=" + (optimizationRun != null ? optimizationRun.getId() : null) +
                ", pageId=" + (page != null ? page.getId() : null) +
                ", parentPageId=" + (parentPage != null ? parentPage.getId() : null) +
                ", position=" + position +
                '}';
    }
}
