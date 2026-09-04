package com.example.audit_risk_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.audit_risk_management.model.NotificationConfiguration;

public interface NotificationConfigurationRepository
        extends JpaRepository<NotificationConfiguration, Long> {

}