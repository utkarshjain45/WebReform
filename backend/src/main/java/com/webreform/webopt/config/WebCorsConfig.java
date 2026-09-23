package com.webreform.webopt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebCorsConfig {

    @Value("${cors.allowed-origins:*}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                var registration = registry.addMapping("/**")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true);

                if ("*".equals(allowedOrigins.trim())) {
                    registration.allowedOriginPatterns("*");
                } else {
                    String[] origins = allowedOrigins.split(",");
                    java.util.List<String> cleaned = new java.util.ArrayList<>();
                    for (String o : origins) {
                        String s = o.trim().replaceAll("/+$", "");
                        if (!s.isEmpty()) {
                            cleaned.add(s);
                        }
                    }
                    registration.allowedOrigins(cleaned.toArray(new String[0]));
                }
            }
        };
    }
}
