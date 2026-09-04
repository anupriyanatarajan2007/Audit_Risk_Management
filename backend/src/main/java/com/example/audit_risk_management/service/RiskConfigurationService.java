package com.example.audit_risk_management.service;

import com.example.audit_risk_management.dto.RiskConfigurationRequestDTO;
import com.example.audit_risk_management.dto.RiskConfigurationResponseDTO;

public interface RiskConfigurationService {

    RiskConfigurationResponseDTO getConfiguration();

    RiskConfigurationResponseDTO updateConfiguration(
            RiskConfigurationRequestDTO request);
}