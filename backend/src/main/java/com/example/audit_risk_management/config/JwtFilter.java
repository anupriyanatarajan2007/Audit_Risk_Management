package com.example.audit_risk_management.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepo userRepo;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");


        // =====================================================
        // NO JWT TOKEN
        // =====================================================

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }


        try {

            String token = authHeader.substring(7);

            String email = jwtUtil.extractEmail(token);


            User user = userRepo
                    .findByEmail(email)
                    .orElse(null);


            if (user != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {


                // =================================================
                // AUTHORITIES
                // =================================================

                Collection<GrantedAuthority> authorities =
                        getAuthorities(user);


                // =================================================
                // DEBUG
                // =================================================

                System.out.println("JWT EMAIL = " + email);

                if (user.getRole() != null) {
                    System.out.println(
                            "USER ROLE = "
                            + user.getRole().getName()
                    );
                }

                System.out.println(
                        "AUTHORITIES = " + authorities
                );


                // =================================================
                // AUTHENTICATION
                // =================================================

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                        );


                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }


        } catch (Exception e) {

            System.out.println(
                    "JWT Error: " + e.getMessage()
            );
        }


        filterChain.doFilter(request, response);
    }


    // =========================================================
    // GET USER AUTHORITIES
    // =========================================================

    private Collection<GrantedAuthority> getAuthorities(
            User user) {

        List<GrantedAuthority> authorities =
                new ArrayList<>();


        // =====================================================
        // ROLE
        // =====================================================

        Role role = user.getRole();

        if (role != null) {

            authorities.add(
                    new SimpleGrantedAuthority(
                            "ROLE_" + role.getName()
                    )
            );


            // =================================================
            // PERMISSIONS
            // =================================================

            if (role.getPermissions() != null) {

                role.getPermissions().forEach(permission -> {

                    authorities.add(
                            new SimpleGrantedAuthority(
                                    permission.getName()
                            )
                    );

                });
            }
        }


        return authorities;
    }
}