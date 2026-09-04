package com.example.audit_risk_management.service;

import com.example.audit_risk_management.dto.NotificationConfigurationRequestDTO;
import com.example.audit_risk_management.dto.NotificationConfigurationResponseDTO;

public interface NotificationConfigurationService {

    NotificationConfigurationResponseDTO getConfiguration();

    NotificationConfigurationResponseDTO updateConfiguration(
            NotificationConfigurationRequestDTO request
    );
}