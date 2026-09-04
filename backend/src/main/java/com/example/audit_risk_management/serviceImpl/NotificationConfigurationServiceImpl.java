package com.example.audit_risk_management.serviceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.NotificationConfigurationRequestDTO;
import com.example.audit_risk_management.dto.NotificationConfigurationResponseDTO;
import com.example.audit_risk_management.model.NotificationConfiguration;
import com.example.audit_risk_management.repository.NotificationConfigurationRepository;
import com.example.audit_risk_management.service.NotificationConfigurationService;

@Service
@Transactional
public class NotificationConfigurationServiceImpl
        implements NotificationConfigurationService {

    private final NotificationConfigurationRepository repository;


    public NotificationConfigurationServiceImpl(
            NotificationConfigurationRepository repository) {

        this.repository = repository;
    }


    // =========================================================
    // GET CONFIGURATION
    // =========================================================

    @Override
    public NotificationConfigurationResponseDTO getConfiguration() {

        NotificationConfiguration configuration =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(
                                this::createDefaultConfiguration
                        );

        return convertToDTO(configuration);
    }


    // =========================================================
    // UPDATE CONFIGURATION
    // =========================================================

    @Override
    public NotificationConfigurationResponseDTO updateConfiguration(
            NotificationConfigurationRequestDTO request) {

        validateConfiguration(request);

        NotificationConfiguration configuration =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(
                                NotificationConfiguration::new
                        );


        configuration.setEmailNotificationsEnabled(
                request.getEmailNotificationsEnabled()
        );

        configuration.setInAppNotificationsEnabled(
                request.getInAppNotificationsEnabled()
        );

        configuration.setAuditNotificationsEnabled(
                request.getAuditNotificationsEnabled()
        );

        configuration.setRiskNotificationsEnabled(
                request.getRiskNotificationsEnabled()
        );

        configuration.setComplianceNotificationsEnabled(
                request.getComplianceNotificationsEnabled()
        );

        configuration.setReminderNotificationsEnabled(
                request.getReminderNotificationsEnabled()
        );

        configuration.setReminderDaysBeforeDue(
                request.getReminderDaysBeforeDue()
        );


        NotificationConfiguration saved =
                repository.save(configuration);

        return convertToDTO(saved);
    }


    // =========================================================
    // DEFAULT CONFIGURATION
    // =========================================================

    private NotificationConfiguration createDefaultConfiguration() {

        NotificationConfiguration configuration =
                new NotificationConfiguration();

        configuration.setEmailNotificationsEnabled(true);

        configuration.setInAppNotificationsEnabled(true);

        configuration.setAuditNotificationsEnabled(true);

        configuration.setRiskNotificationsEnabled(true);

        configuration.setComplianceNotificationsEnabled(true);

        configuration.setReminderNotificationsEnabled(true);

        configuration.setReminderDaysBeforeDue(7);

        return repository.save(configuration);
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateConfiguration(
            NotificationConfigurationRequestDTO request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Notification configuration is required"
            );
        }


        if (request.getEmailNotificationsEnabled() == null ||
                request.getInAppNotificationsEnabled() == null ||
                request.getAuditNotificationsEnabled() == null ||
                request.getRiskNotificationsEnabled() == null ||
                request.getComplianceNotificationsEnabled() == null ||
                request.getReminderNotificationsEnabled() == null ||
                request.getReminderDaysBeforeDue() == null) {

            throw new IllegalArgumentException(
                    "All notification configuration values are required"
            );
        }


        if (request.getReminderDaysBeforeDue() < 0) {

            throw new IllegalArgumentException(
                    "Reminder days cannot be negative"
            );
        }
    }


    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private NotificationConfigurationResponseDTO convertToDTO(
            NotificationConfiguration configuration) {

        return new NotificationConfigurationResponseDTO(

                configuration.getId(),

                configuration.getEmailNotificationsEnabled(),

                configuration.getInAppNotificationsEnabled(),

                configuration.getAuditNotificationsEnabled(),

                configuration.getRiskNotificationsEnabled(),

                configuration.getComplianceNotificationsEnabled(),

                configuration.getReminderNotificationsEnabled(),

                configuration.getReminderDaysBeforeDue()
        );
    }
}