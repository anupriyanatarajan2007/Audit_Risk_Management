package com.example.audit_risk_management.service;

import com.example.audit_risk_management.dto.AuditConfigurationRequestDTO;
import com.example.audit_risk_management.dto.AuditConfigurationResponseDTO;

public interface AuditConfigurationService {

    AuditConfigurationResponseDTO getConfiguration();

    AuditConfigurationResponseDTO updateConfiguration(
            AuditConfigurationRequestDTO request);
}