package com.example.audit_risk_management.config;

import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        if (authentication.getAuthorities()
                .contains(new SimpleGrantedAuthority("ADMIN"))) {

            response.sendRedirect("/admin/dashboard");
        }
        else if (authentication.getAuthorities()
                .contains(new SimpleGrantedAuthority("STUDENT"))) {

            response.sendRedirect("/user/home");
        }
        else {
            response.sendRedirect("/home");
        }
    }
}