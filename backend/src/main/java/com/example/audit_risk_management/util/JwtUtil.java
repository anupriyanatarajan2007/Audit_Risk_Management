package com.example.audit_risk_management.util;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.example.audit_risk_management.model.SystemSettings;
import com.example.audit_risk_management.repository.SystemSettingsRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final String SECRET = "anupriya2007anupriya2007anupriya2007";

    private final SystemSettingsRepository systemConfigurationRepository;

    public JwtUtil(SystemSettingsRepository systemConfigurationRepository) {
        this.systemConfigurationRepository = systemConfigurationRepository;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String email) {

        // Get system configuration from DB
        SystemSettings configuration =
                systemConfigurationRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "System configuration not found"
                                )
                        );

        // Get session timeout from DB
        Integer sessionTimeoutMinutes =
                configuration.getSessionTimeoutMinutes();

        if (sessionTimeoutMinutes == null ||
            sessionTimeoutMinutes <= 0) {

            throw new RuntimeException(
                    "Invalid session timeout configuration"
            );
        }

        // Convert minutes to milliseconds
        long expirationMillis =
                sessionTimeoutMinutes * 60L * 1000L;

        Date now = new Date();

        Date expiration =
                new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    public String extractEmail(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {

        try {

            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}