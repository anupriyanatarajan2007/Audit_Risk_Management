package com.example.audit_risk_management.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        Path uploadPath =
                Paths.get("uploads/evidence")
                        .toAbsolutePath()
                        .normalize();

        registry.addResourceHandler(
                "/uploads/evidence/**"
        ).addResourceLocations(
                "file:" + uploadPath.toString() + "/"
        );
    }
}