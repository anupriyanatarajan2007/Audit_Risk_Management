package com.example.audit_risk_management.serviceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.SystemSettingsRequestDTO;
import com.example.audit_risk_management.dto.SystemSettingsResponseDTO;
import com.example.audit_risk_management.model.SystemSettings;
import com.example.audit_risk_management.repository.SystemSettingsRepository;
import com.example.audit_risk_management.service.SystemSettingsService;

@Service
@Transactional
public class SystemSettingsServiceImpl
        implements SystemSettingsService {

    private final SystemSettingsRepository repository;


    public SystemSettingsServiceImpl(
            SystemSettingsRepository repository) {

        this.repository = repository;
    }


    // =========================================================
    // GET SETTINGS
    // =========================================================

    @Override
    public SystemSettingsResponseDTO getSettings() {

        SystemSettings settings =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(
                                this::createDefaultSettings
                        );

        return convertToDTO(settings);
    }


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    @Override
    public SystemSettingsResponseDTO updateSettings(
            SystemSettingsRequestDTO request) {

        validateSettings(request);

        SystemSettings settings =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(
                                SystemSettings::new
                        );


        settings.setSystemName(
                request.getSystemName()
        );

        settings.setTimezone(
                request.getTimezone()
        );

        settings.setDateFormat(
                request.getDateFormat()
        );

        settings.setMaintenanceMode(
                request.getMaintenanceMode()
        );

        settings.setSessionTimeoutMinutes(
                request.getSessionTimeoutMinutes()
        );

        settings.setMaxLoginAttempts(
                request.getMaxLoginAttempts()
        );

        settings.setPasswordExpiryDays(
                request.getPasswordExpiryDays()
        );

        settings.setEnableAuditLogs(
                request.getEnableAuditLogs()
        );


        SystemSettings saved =
                repository.save(settings);

        return convertToDTO(saved);
    }


    // =========================================================
    // DEFAULT SETTINGS
    // =========================================================

    private SystemSettings createDefaultSettings() {

        SystemSettings settings =
                new SystemSettings();

        settings.setSystemName(
                "Audit & Risk Management System"
        );

        settings.setTimezone(
                "Asia/Kolkata"
        );

        settings.setDateFormat(
                "dd-MM-yyyy"
        );

        settings.setMaintenanceMode(
                false
        );

        settings.setSessionTimeoutMinutes(
                30
        );

        settings.setMaxLoginAttempts(
                5
        );

        settings.setPasswordExpiryDays(
                90
        );

        settings.setEnableAuditLogs(
                true
        );


        return repository.save(settings);
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateSettings(
            SystemSettingsRequestDTO request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "System settings are required"
            );
        }


        if (request.getSystemName() == null ||
                request.getSystemName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "System name is required"
            );
        }


        if (request.getTimezone() == null ||
                request.getTimezone().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Timezone is required"
            );
        }


        if (request.getDateFormat() == null ||
                request.getDateFormat().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Date format is required"
            );
        }


        if (request.getMaintenanceMode() == null ||
                request.getEnableAuditLogs() == null) {

            throw new IllegalArgumentException(
                    "Boolean settings are required"
            );
        }


        if (request.getSessionTimeoutMinutes() == null ||
                request.getSessionTimeoutMinutes() <= 0) {

            throw new IllegalArgumentException(
                    "Session timeout must be greater than 0"
            );
        }


        if (request.getMaxLoginAttempts() == null ||
                request.getMaxLoginAttempts() <= 0) {

            throw new IllegalArgumentException(
                    "Maximum login attempts must be greater than 0"
            );
        }


        if (request.getPasswordExpiryDays() == null ||
                request.getPasswordExpiryDays() <= 0) {

            throw new IllegalArgumentException(
                    "Password expiry days must be greater than 0"
            );
        }
    }


    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private SystemSettingsResponseDTO convertToDTO(
            SystemSettings settings) {

        return new SystemSettingsResponseDTO(

                settings.getId(),

                settings.getSystemName(),

                settings.getTimezone(),

                settings.getDateFormat(),

                settings.getMaintenanceMode(),

                settings.getSessionTimeoutMinutes(),

                settings.getMaxLoginAttempts(),

                settings.getPasswordExpiryDays(),

                settings.getEnableAuditLogs()
        );
    }
}