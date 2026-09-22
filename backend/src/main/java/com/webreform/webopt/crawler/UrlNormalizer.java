package com.webreform.webopt.crawler;

import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class UrlNormalizer {

    private static final Set<String> EXCLUDED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
            ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
            ".mp3", ".mp4", ".wav", ".avi", ".mov",
            ".exe", ".dmg", ".apk", ".bin",
            ".css", ".js", ".json", ".xml"
    );

    private static final Pattern MULTI_SLASH_PATTERN = Pattern.compile("(?<!:)/{2,}");

    /**
     * Resolves a raw candidate link relative to the base page URI and normalizes it.
     *
     * @param rawUrl the link text extracted from an anchor tag href
     * @param basePageUri the URI of the page containing the link
     * @return normalized URL string, or null if invalid or excluded
     */
    public String resolveAndNormalize(String rawUrl, URI basePageUri) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }

        String trimmed = rawUrl.trim();

        // Filter out non-navigational links
        String lowerTrimmed = trimmed.toLowerCase(Locale.ROOT);
        if (lowerTrimmed.startsWith("javascript:") ||
            lowerTrimmed.startsWith("mailto:") ||
            lowerTrimmed.startsWith("tel:") ||
            lowerTrimmed.startsWith("data:") ||
            lowerTrimmed.startsWith("#")) {
            return null;
        }

        try {
            URI resolvedUri;
            URI candidateUri = new URI(trimmed);

            if (candidateUri.isAbsolute()) {
                resolvedUri = candidateUri;
            } else if (basePageUri != null) {
                resolvedUri = basePageUri.resolve(candidateUri);
            } else {
                return null;
            }

            return normalize(resolvedUri.toString());
        } catch (URISyntaxException | IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Normalizes a URL string into canonical form:
     * - Lowercase scheme and host
     * - Remove default ports (80 for http, 443 for https)
     * - Remove fragment (#...)
     * - Normalize path slashes
     * - Strip trailing slash (unless root path)
     * - Reject excluded file extensions
     *
     * @param url the raw URL string
     * @return canonical URL string, or null if invalid
     */
    public String normalize(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }

        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme();
            if (scheme == null) {
                return null;
            }
            scheme = scheme.toLowerCase(Locale.ROOT);
            if (!scheme.equals("http") && !scheme.equals("https")) {
                return null;
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return null;
            }
            host = host.toLowerCase(Locale.ROOT);

            // Handle port
            int port = uri.getPort();
            if ((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
                port = -1; // Strip default port
            }

            // Clean path
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                path = "/";
            } else {
                path = MULTI_SLASH_PATTERN.matcher(path).replaceAll("/");
                // Strip trailing slash if path is longer than 1 character
                if (path.length() > 1 && path.endsWith("/")) {
                    path = path.substring(0, path.length() - 1);
                }
            }

            // Exclude static assets
            String lowerPath = path.toLowerCase(Locale.ROOT);
            for (String ext : EXCLUDED_EXTENSIONS) {
                if (lowerPath.endsWith(ext)) {
                    return null;
                }
            }

            // Reassemble canonical URI (omitting fragment and keeping query if present)
            String query = uri.getRawQuery();

            StringBuilder sb = new StringBuilder();
            sb.append(scheme).append("://").append(host);
            if (port != -1) {
                sb.append(":").append(port);
            }
            sb.append(path);
            if (query != null && !query.isBlank()) {
                sb.append("?").append(query);
            }

            return sb.toString();
        } catch (URISyntaxException e) {
            return null;
        }
    }

    /**
     * Determines whether a candidate URL belongs to the same domain/host as the root website.
     *
     * @param candidateUrl the normalized URL to inspect
     * @param rootBaseUrl the normalized base URL of the target website
     * @return true if the candidate URL is internal to the website domain
     */
    public boolean isInternalLink(String candidateUrl, String rootBaseUrl) {
        if (candidateUrl == null || rootBaseUrl == null) {
            return false;
        }

        try {
            URI candidate = new URI(candidateUrl);
            URI root = new URI(rootBaseUrl);

            String candidateHost = candidate.getHost();
            String rootHost = root.getHost();

            if (candidateHost == null || rootHost == null) {
                return false;
            }

            candidateHost = candidateHost.toLowerCase(Locale.ROOT);
            rootHost = rootHost.toLowerCase(Locale.ROOT);

            // Same exact host
            if (candidateHost.equals(rootHost)) {
                return true;
            }

            // Strip www. prefix for broader subdomain matching
            String cleanCandidate = candidateHost.startsWith("www.") ? candidateHost.substring(4) : candidateHost;
            String cleanRoot = rootHost.startsWith("www.") ? rootHost.substring(4) : rootHost;

            return cleanCandidate.equals(cleanRoot);
        } catch (URISyntaxException e) {
            return false;
        }
    }
}
