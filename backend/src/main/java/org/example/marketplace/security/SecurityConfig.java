// src/main/java/.../security/SecurityConfig.java
package org.example.marketplace.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())   // <-- enable CORS in the filter chain
                .csrf(csrf -> csrf.disable())      // often disabled for APIs; keep if you rely on it
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()  // adjust to your auth needs
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // If you use cookies/session, do NOT use "*" here; specify exact origin:
        cfg.setAllowedOriginPatterns(List.of("http://localhost:5173"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Content-Type","Authorization","X-Requested-With"));
        cfg.setAllowCredentials(true); // set to true only if you send cookies
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // apply to your API paths
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }
}
