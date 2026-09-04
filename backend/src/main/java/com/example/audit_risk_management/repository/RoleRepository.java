package com.example.audit_risk_management.repository;

import com.example.audit_risk_management.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    // Only active roles
    Optional<Role> findByNameAndActiveTrue(String name);
}