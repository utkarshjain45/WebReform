package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "navigation_events")
public class NavigationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private UserSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_page_id", nullable = false)
    private Page sourcePage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_page_id", nullable = false)
    private Page targetPage;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @Column
    private Long duration = 0L;

    public NavigationEvent() {
    }

    public NavigationEvent(UserSession session, Page sourcePage, Page targetPage) {
        this.session = session;
        this.sourcePage = sourcePage;
        this.targetPage = targetPage;
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserSession getSession() {
        return session;
    }

    public void setSession(UserSession session) {
        this.session = session;
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

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    @Override
    public String toString() {
        return "NavigationEvent{" +
                "id=" + id +
                ", sessionId=" + (session != null ? session.getId() : null) +
                ", sourcePageId=" + (sourcePage != null ? sourcePage.getId() : null) +
                ", targetPageId=" + (targetPage != null ? targetPage.getId() : null) +
                ", timestamp=" + timestamp +
                ", duration=" + duration +
                '}';
    }
}
