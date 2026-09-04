package com.example.audit_risk_management.repository;

import com.example.audit_risk_management.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByName(String name);

    boolean existsByName(String name);

    // Get permissions by module
    List<Permission> findByModule(String module);

    // Get only active permissions
    List<Permission> findByActiveTrue();

    // Get active permissions by module
    List<Permission> findByModuleAndActiveTrue(String module);
}