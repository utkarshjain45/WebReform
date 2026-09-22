package com.webreform.webopt.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_sessions")
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false)
    private Website website;

    @Column(name = "session_identifier", nullable = false)
    private String sessionIdentifier;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NavigationEvent> navigationEvents = new ArrayList<>();

    public UserSession() {
    }

    public UserSession(Website website, String sessionIdentifier) {
        this.website = website;
        this.sessionIdentifier = sessionIdentifier;
    }

    @PrePersist
    protected void onCreate() {
        if (this.startedAt == null) {
            this.startedAt = Instant.now();
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

    public String getSessionIdentifier() {
        return sessionIdentifier;
    }

    public void setSessionIdentifier(String sessionIdentifier) {
        this.sessionIdentifier = sessionIdentifier;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public List<NavigationEvent> getNavigationEvents() {
        return navigationEvents;
    }

    public void setNavigationEvents(List<NavigationEvent> navigationEvents) {
        this.navigationEvents = navigationEvents;
    }

    public void addNavigationEvent(NavigationEvent event) {
        navigationEvents.add(event);
        event.setSession(this);
    }

    @Override
    public String toString() {
        return "UserSession{" +
                "id=" + id +
                ", sessionIdentifier='" + sessionIdentifier + '\'' +
                ", startedAt=" + startedAt +
                ", endedAt=" + endedAt +
                '}';
    }
}
