package com.example.audit_risk_management.service;

import com.example.audit_risk_management.dto.SystemSettingsRequestDTO;
import com.example.audit_risk_management.dto.SystemSettingsResponseDTO;

public interface SystemSettingsService {

    SystemSettingsResponseDTO getSettings();

    SystemSettingsResponseDTO updateSettings(
            SystemSettingsRequestDTO request
    );
}