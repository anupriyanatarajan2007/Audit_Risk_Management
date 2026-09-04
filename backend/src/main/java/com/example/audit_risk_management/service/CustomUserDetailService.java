package com.example.audit_risk_management.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.repository.UserRepo;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                getAuthorities(user)
        );
    }


    // =====================================================
    // AUTHORITIES
    // =====================================================

    private Collection<? extends GrantedAuthority> getAuthorities(
            User user) {

        List<GrantedAuthority> authorities = new ArrayList<>();

        Role role = user.getRole();

        if (role != null) {

            // Role
            authorities.add(
                new SimpleGrantedAuthority(
                    "ROLE_" + role.getName()
                )
            );


            // =================================================
            // CHIEF AUDIT EXECUTIVE
            // =================================================

            if ("CHIEF_AUDIT_EXECUTIVE".equals(
                    role.getName())) {

                authorities.add(
                    new SimpleGrantedAuthority("READ")
                );

                authorities.add(
                    new SimpleGrantedAuthority("WRITE")
                );

                authorities.add(
                    new SimpleGrantedAuthority("DELETE")
                );
            }


            // =================================================
            // AUDITEE
            // =================================================

            if ("AUDITEE".equals(role.getName())) {

                authorities.add(
                    new SimpleGrantedAuthority("READ")
                );
            }


            // =================================================
            // ROLE PERMISSIONS FROM DATABASE
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