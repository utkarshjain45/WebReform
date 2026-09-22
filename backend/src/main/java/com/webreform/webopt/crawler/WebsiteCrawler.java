package com.webreform.webopt.crawler;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.util.*;

@Component
public class WebsiteCrawler {

    private static final Logger log = LoggerFactory.getLogger(WebsiteCrawler.class);

    private final UrlNormalizer urlNormalizer;
    private final SsrfProtectionValidator ssrfValidator;

    @Value("${crawler.user-agent:WebReform-Crawler/1.0 (+https://webreform.io)}")
    private String userAgent;

    @Value("${crawler.connect-timeout-ms:6000}")
    private int connectTimeoutMs;

    @Value("${crawler.max-body-size-bytes:2097152}")
    private int maxBodySizeBytes;

    public WebsiteCrawler(UrlNormalizer urlNormalizer, SsrfProtectionValidator ssrfValidator) {
        this.urlNormalizer = urlNormalizer;
        this.ssrfValidator = ssrfValidator;
    }

    private static class QueueItem {
        final String url;
        final int depth;

        QueueItem(String url, int depth) {
            this.url = url;
            this.depth = depth;
        }
    }

    /**
     * Crawls internal website pages using Breadth-First Search (BFS).
     *
     * @param rootBaseUrl starting root URL for the website
     * @param maxPages maximum number of unique pages to discover
     * @param maxDepth maximum click depth from the root URL
     * @param statusCallback optional listener to report progress
     * @return List of discovered and parsed CrawlResult pages
     */
    public List<CrawlResult> crawlWebsite(
            String rootBaseUrl,
            int maxPages,
            int maxDepth,
            CrawlJobStatus statusCallback) {

        String canonicalRoot = urlNormalizer.normalize(rootBaseUrl);
        if (canonicalRoot == null) {
            throw new IllegalArgumentException("Invalid or malformed starting URL: " + rootBaseUrl);
        }

        // SSRF validation for root URL
        ssrfValidator.validateUri(URI.create(canonicalRoot));

        List<CrawlResult> results = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        Queue<QueueItem> queue = new ArrayDeque<>();

        queue.add(new QueueItem(canonicalRoot, 0));
        visited.add(canonicalRoot);

        int totalLinksDiscovered = 0;

        while (!queue.isEmpty() && results.size() < maxPages) {
            QueueItem current = queue.poll();

            log.debug("Crawling [depth={}/{}]: {}", current.depth, maxDepth, current.url);

            long startTime = System.nanoTime();
            Document document;
            try {
                // Pre-flight SSRF check
                ssrfValidator.validateUri(URI.create(current.url));

                Connection.Response response = Jsoup.connect(current.url)
                        .userAgent(userAgent)
                        .timeout(connectTimeoutMs)
                        .maxBodySize(maxBodySizeBytes)
                        .followRedirects(true)
                        .ignoreHttpErrors(false)
                        .execute();

                // Only parse HTML content
                String contentType = response.contentType();
                if (contentType != null && !contentType.toLowerCase().contains("text/html")) {
                    log.debug("Skipping non-HTML content type '{}' for {}", contentType, current.url);
                    continue;
                }

                document = response.parse();
            } catch (IOException | IllegalArgumentException e) {
                log.warn("Failed to fetch or validate URL {}: {}", current.url, e.getMessage());
                continue;
            }

            double loadTimeMs = (System.nanoTime() - startTime) / 1_000_000.0;

            // 1. Extract Page Title
            String title = document.title();
            if (title != null && title.length() > 500) {
                title = title.substring(0, 497) + "...";
            }

            // 2. Extract Headings & Visible Text
            Elements headings = document.select("h1, h2, h3");
            StringBuilder contentBuilder = new StringBuilder();
            for (Element heading : headings) {
                String hText = heading.text().trim();
                if (!hText.isEmpty()) {
                    contentBuilder.append(hText).append("\n");
                }
            }

            String bodyText = document.body() != null ? document.body().text() : "";
            if (bodyText.length() > 4000) {
                bodyText = bodyText.substring(0, 4000);
            }
            contentBuilder.append(bodyText);

            // 3. Extract and normalize internal hyperlinks
            URI basePageUri = URI.create(current.url);
            Elements anchorElements = document.select("a[href]");
            Set<String> internalLinks = new LinkedHashSet<>();

            for (Element anchor : anchorElements) {
                String rawHref = anchor.attr("href");
                String normalizedTarget = urlNormalizer.resolveAndNormalize(rawHref, basePageUri);

                if (normalizedTarget != null && urlNormalizer.isInternalLink(normalizedTarget, canonicalRoot)) {
                    internalLinks.add(normalizedTarget);
                    totalLinksDiscovered++;

                    // Queue for further exploration if under depth limit and not yet visited
                    if (current.depth + 1 <= maxDepth && !visited.contains(normalizedTarget)) {
                        visited.add(normalizedTarget);
                        queue.add(new QueueItem(normalizedTarget, current.depth + 1));
                    }
                }
            }

            CrawlResult crawlResult = new CrawlResult(
                    current.url,
                    title,
                    contentBuilder.toString(),
                    current.depth,
                    loadTimeMs,
                    internalLinks
            );
            results.add(crawlResult);

            if (statusCallback != null) {
                statusCallback.setPagesCrawled(results.size());
                statusCallback.setLinksDiscovered(totalLinksDiscovered);
            }
        }

        log.info("Crawl completed for '{}': {} pages discovered, {} total internal links found.",
                canonicalRoot, results.size(), totalLinksDiscovered);

        return results;
    }
}
