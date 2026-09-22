package com.webreform.webopt.crawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.util.LinkedHashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class LinkExtractionTest {

    private UrlNormalizer normalizer;

    @BeforeEach
    void setUp() {
        normalizer = new UrlNormalizer();
    }

    @Test
    @DisplayName("Should parse HTML elements, extract title, headings, and internal links")
    void testHtmlLinkExtraction() {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Computer Science - Academic Portal</title>
            </head>
            <body>
                <h1>Department of Computer Science</h1>
                <h2>Research Areas</h2>
                <p>Explore our latest research in algorithms and optimization.</p>
                <nav>
                    <a href="/algorithms">Algorithms</a>
                    <a href="https://example.com/faculty/">Faculty Members</a>
                    <a href="../contact">Contact Us</a>
                    <a href="https://external-site.org/resource">External Partner</a>
                    <a href="javascript:void(0)">Click here</a>
                    <a href="#research-topics">Jump to Topics</a>
                    <a href="/downloads/syllabus.pdf">Syllabus (PDF)</a>
                </nav>
            </body>
            </html>
            """;

        Document doc = Jsoup.parse(html, "https://example.com/departments/cs");

        // 1. Title
        assertEquals("Computer Science - Academic Portal", doc.title());

        // 2. Headings
        Elements headings = doc.select("h1, h2, h3");
        assertEquals(2, headings.size());
        assertEquals("Department of Computer Science", headings.get(0).text());
        assertEquals("Research Areas", headings.get(1).text());

        // 3. Extract and filter links
        String rootUrl = "https://example.com";
        URI basePageUri = URI.create("https://example.com/departments/cs");
        Elements anchorElements = doc.select("a[href]");

        Set<String> internalLinks = new LinkedHashSet<>();
        for (Element anchor : anchorElements) {
            String rawHref = anchor.attr("href");
            String normalized = normalizer.resolveAndNormalize(rawHref, basePageUri);
            if (normalized != null && normalizer.isInternalLink(normalized, rootUrl)) {
                internalLinks.add(normalized);
            }
        }

        // Verify extracted internal links
        assertTrue(internalLinks.contains("https://example.com/algorithms"));
        assertTrue(internalLinks.contains("https://example.com/faculty"));
        assertTrue(internalLinks.contains("https://example.com/contact"));

        // Verify excluded links
        assertFalse(internalLinks.contains("https://external-site.org/resource"), "External link should be ignored");
        assertFalse(internalLinks.contains("https://example.com/downloads/syllabus.pdf"), "PDF should be ignored");
        assertEquals(3, internalLinks.size());
    }
}
