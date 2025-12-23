package org.example.marketplace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();

        // IMPORTANT: use URI (works reliably on Windows)
        String location = uploadPath.toUri().toString(); // ex: file:/D:/biobuy/backend/uploads/

        // make sure it ends with "/"
        if (!location.endsWith("/")) location = location + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }

}
