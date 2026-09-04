package com.example.audit_risk_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.AuditConfiguration;

@Repository
public interface AuditConfigurationRepository
        extends JpaRepository<AuditConfiguration, Long> {
}