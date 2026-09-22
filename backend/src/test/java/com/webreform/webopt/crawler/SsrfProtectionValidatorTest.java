package com.webreform.webopt.crawler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;

import static org.junit.jupiter.api.Assertions.*;

class SsrfProtectionValidatorTest {

    private SsrfProtectionValidator validator;

    @BeforeEach
    void setUp() {
        validator = new SsrfProtectionValidator();
    }

    @Test
    @DisplayName("Should reject non-HTTP/HTTPS protocols")
    void testRejectInvalidProtocols() {
        assertThrows(IllegalArgumentException.class, () ->
                validator.validateUri(URI.create("file:///etc/passwd")));

        assertThrows(IllegalArgumentException.class, () ->
                validator.validateUri(URI.create("ftp://ftp.example.com")));

        assertThrows(IllegalArgumentException.class, () ->
                validator.validateUri(URI.create("gopher://example.com")));
    }

    @Test
    @DisplayName("Should reject loopback and localhost hostnames")
    void testRejectLocalhost() {
        assertThrows(IllegalArgumentException.class, () ->
                validator.validateUri(URI.create("http://localhost:8080/admin")));

        assertThrows(IllegalArgumentException.class, () ->
                validator.validateUri(URI.create("http://127.0.0.1:5432")));

        assertThrows(IllegalArgumentException.class, () ->
                validator.validateUri(URI.create("http://[::1]:8080")));
    }

    @Test
    @DisplayName("Should reject private RFC 1918 and cloud metadata IP addresses")
    void testRejectPrivateIpAddresses() throws UnknownHostException {
        // 10.0.0.1 (Private class A)
        InetAddress privateA = InetAddress.getByName("10.0.0.1");
        assertThrows(IllegalArgumentException.class, () ->
                validator.validateIpAddress(privateA, "10.0.0.1"));

        // 172.16.0.1 (Private class B)
        InetAddress privateB = InetAddress.getByName("172.16.0.1");
        assertThrows(IllegalArgumentException.class, () ->
                validator.validateIpAddress(privateB, "172.16.0.1"));

        // 192.168.1.1 (Private class C)
        InetAddress privateC = InetAddress.getByName("192.168.1.1");
        assertThrows(IllegalArgumentException.class, () ->
                validator.validateIpAddress(privateC, "192.168.1.1"));

        // 169.254.169.254 (Cloud metadata endpoint)
        InetAddress metadata = InetAddress.getByName("169.254.169.254");
        assertThrows(IllegalArgumentException.class, () ->
                validator.validateIpAddress(metadata, "169.254.169.254"));
    }
}
