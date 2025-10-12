// src/main/java/org/example/marketplace/DebugDataSource.java
package org.example.marketplace;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DebugDataSource {
    @Value("${spring.datasource.url:}")    String url;
    @Value("${spring.datasource.username:}") String user;

    @PostConstruct
    void log() {
        System.out.println("=== DS ===");
        System.out.println("URL  = " + url);
        System.out.println("USER = " + user);
    }
}
