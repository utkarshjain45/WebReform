package com.webreform.webopt.crawler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Set;

@Component
public class SsrfProtectionValidator {

    private static final Logger log = LoggerFactory.getLogger(SsrfProtectionValidator.class);

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    private static final Set<String> BLOCKED_HOSTNAMES = Set.of(
            "localhost",
            "127.0.0.1",
            "::1",
            "0.0.0.0",
            "metadata.google.internal",
            "instance-data"
    );

    /**
     * Validates a target URI to mitigate SSRF (Server-Side Request Forgery) attacks.
     *
     * @param uri the URI to validate
     * @throws IllegalArgumentException if the URI violates security rules
     */
    public void validateUri(URI uri) {
        if (uri == null) {
            throw new IllegalArgumentException("Target URI must not be null");
        }

        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Invalid protocol scheme: '" + scheme + "'. Only HTTP and HTTPS are permitted."
            );
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Target URI must contain a valid hostname");
        }

        String lowerHost = host.toLowerCase();

        // 1. Block known local hostnames directly
        if (BLOCKED_HOSTNAMES.contains(lowerHost) || lowerHost.endsWith(".localhost") || lowerHost.endsWith(".local")) {
            throw new IllegalArgumentException("Access to local/loopback host '" + host + "' is blocked by SSRF protection.");
        }

        // 2. Resolve DNS and inspect all underlying IP addresses
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                validateIpAddress(address, host);
            }
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException("Unable to resolve hostname '" + host + "': " + e.getMessage());
        }
    }

    /**
     * Checks an resolved IP address against restricted ranges.
     */
    public void validateIpAddress(InetAddress address, String host) {
        if (address.isLoopbackAddress()) {
            throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to loopback IP " + address.getHostAddress());
        }

        if (address.isAnyLocalAddress()) {
            throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to wildcard local IP " + address.getHostAddress());
        }

        if (address.isSiteLocalAddress()) {
            throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to private network IP (RFC 1918) " + address.getHostAddress());
        }

        if (address.isLinkLocalAddress()) {
            throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to link-local IP " + address.getHostAddress());
        }

        if (address.isMulticastAddress()) {
            throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to multicast IP " + address.getHostAddress());
        }

        // Block AWS/GCP/Azure link-local cloud metadata endpoint (169.254.169.254) and Carrier-Grade NAT (100.64.0.0/10)
        byte[] bytes = address.getAddress();
        if (bytes.length == 4) {
            int b0 = bytes[0] & 0xFF;
            int b1 = bytes[1] & 0xFF;

            // 169.254.x.x (Link-local & cloud metadata)
            if (b0 == 169 && b1 == 254) {
                throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to cloud metadata IP range 169.254.0.0/16");
            }

            // 100.64.0.0/10 (Carrier grade NAT)
            if (b0 == 100 && (b1 >= 64 && b1 <= 127)) {
                throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to shared address space 100.64.0.0/10");
            }

            // 0.x.x.x
            if (b0 == 0) {
                throw new IllegalArgumentException("SSRF blocked: Host '" + host + "' resolves to reserved zero IP range 0.0.0.0/8");
            }
        }
    }
}
