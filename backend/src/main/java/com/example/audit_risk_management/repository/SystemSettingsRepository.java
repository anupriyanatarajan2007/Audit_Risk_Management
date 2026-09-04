package com.example.audit_risk_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.SystemSettings;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {

    Optional<SystemSettings> findFirstByOrderByIdAsc();
}
