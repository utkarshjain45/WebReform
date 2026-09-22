package com.webreform.webopt.crawler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;

class UrlNormalizerTest {

    private UrlNormalizer normalizer;

    @BeforeEach
    void setUp() {
        normalizer = new UrlNormalizer();
    }

    @Test
    @DisplayName("Should normalize scheme and host to lowercase and strip default ports")
    void testNormalizeSchemeAndHost() {
        String url = "HTTP://Example.COM:80/path";
        String normalized = normalizer.normalize(url);
        assertEquals("http://example.com/path", normalized);

        String httpsUrl = "HTTPS://Example.COM:443/secure";
        String httpsNormalized = normalizer.normalize(httpsUrl);
        assertEquals("https://example.com/secure", httpsNormalized);
    }

    @Test
    @DisplayName("Should strip fragments and preserve query parameters")
    void testStripFragment() {
        String url = "https://example.com/articles?page=1#comments";
        String normalized = normalizer.normalize(url);
        assertEquals("https://example.com/articles?page=1", normalized);
    }

    @Test
    @DisplayName("Should strip trailing slash from non-root paths")
    void testStripTrailingSlash() {
        String urlWithSlash = "https://example.com/about/";
        assertEquals("https://example.com/about", normalizer.normalize(urlWithSlash));

        String rootUrl = "https://example.com/";
        assertEquals("https://example.com/", normalizer.normalize(rootUrl));
    }

    @Test
    @DisplayName("Should resolve relative links against base page URI")
    void testResolveRelativeLinks() {
        URI baseUri = URI.create("https://example.com/blog/posts");

        assertEquals("https://example.com/about", normalizer.resolveAndNormalize("/about", baseUri));
        assertEquals("https://example.com/blog/article-1", normalizer.resolveAndNormalize("article-1", baseUri));
        assertEquals("https://example.com/contact", normalizer.resolveAndNormalize("../contact", baseUri));
    }

    @Test
    @DisplayName("Should filter out non-HTTP schemes and anchor fragments")
    void testRejectNonNavigationalLinks() {
        URI baseUri = URI.create("https://example.com");

        assertNull(normalizer.resolveAndNormalize("javascript:void(0)", baseUri));
        assertNull(normalizer.resolveAndNormalize("mailto:info@example.com", baseUri));
        assertNull(normalizer.resolveAndNormalize("tel:+1234567890", baseUri));
        assertNull(normalizer.resolveAndNormalize("#section", baseUri));
        assertNull(normalizer.resolveAndNormalize("ftp://example.com/file", baseUri));
    }

    @Test
    @DisplayName("Should exclude static binary and media file extensions")
    void testExcludeStaticAssets() {
        URI baseUri = URI.create("https://example.com");

        assertNull(normalizer.resolveAndNormalize("/assets/report.pdf", baseUri));
        assertNull(normalizer.resolveAndNormalize("/images/logo.png", baseUri));
        assertNull(normalizer.resolveAndNormalize("/bundle.js", baseUri));
        assertNull(normalizer.resolveAndNormalize("/style.css", baseUri));
    }

    @Test
    @DisplayName("Should correctly identify internal vs external links")
    void testIsInternalLink() {
        String root = "https://example.com";

        assertTrue(normalizer.isInternalLink("https://example.com/about", root));
        assertTrue(normalizer.isInternalLink("https://www.example.com/contact", root));
        assertFalse(normalizer.isInternalLink("https://otherdomain.org/page", root));
        assertFalse(normalizer.isInternalLink("https://sub.otherdomain.com", root));
    }
}
