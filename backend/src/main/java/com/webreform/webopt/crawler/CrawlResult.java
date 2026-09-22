package com.webreform.webopt.crawler;

import java.util.Collections;
import java.util.Set;

public class CrawlResult {

    private final String url;
    private final String title;
    private final String content;
    private final int depth;
    private final double loadTimeMs;
    private final Set<String> internalLinks;

    public CrawlResult(String url, String title, String content, int depth, double loadTimeMs, Set<String> internalLinks) {
        this.url = url;
        this.title = title;
        this.content = content;
        this.depth = depth;
        this.loadTimeMs = loadTimeMs;
        this.internalLinks = internalLinks != null ? Collections.unmodifiableSet(internalLinks) : Collections.emptySet();
    }

    public String getUrl() {
        return url;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public int getDepth() {
        return depth;
    }

    public double getLoadTimeMs() {
        return loadTimeMs;
    }

    public Set<String> getInternalLinks() {
        return internalLinks;
    }
}
