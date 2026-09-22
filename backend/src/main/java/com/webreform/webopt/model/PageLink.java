package com.webreform.webopt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "page_links", uniqueConstraints = {
    @UniqueConstraint(name = "uk_page_links_source_target", columnNames = {"source_page_id", "target_page_id"})
})
public class PageLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_page_id", nullable = false)
    private Page sourcePage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_page_id", nullable = false)
    private Page targetPage;

    public PageLink() {
    }

    public PageLink(Page sourcePage, Page targetPage) {
        this.sourcePage = sourcePage;
        this.targetPage = targetPage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Page getSourcePage() {
        return sourcePage;
    }

    public void setSourcePage(Page sourcePage) {
        this.sourcePage = sourcePage;
    }

    public Page getTargetPage() {
        return targetPage;
    }

    public void setTargetPage(Page targetPage) {
        this.targetPage = targetPage;
    }

    @Override
    public String toString() {
        return "PageLink{" +
                "id=" + id +
                ", sourcePageId=" + (sourcePage != null ? sourcePage.getId() : null) +
                ", targetPageId=" + (targetPage != null ? targetPage.getId() : null) +
                '}';
    }
}
