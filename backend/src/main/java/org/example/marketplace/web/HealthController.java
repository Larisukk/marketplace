// src/main/java/org/example/marketplace/web/HealthController.java
package org.example.marketplace.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }
}
