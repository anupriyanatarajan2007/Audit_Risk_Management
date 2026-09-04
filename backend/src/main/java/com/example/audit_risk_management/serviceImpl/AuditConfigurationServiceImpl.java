package com.example.audit_risk_management.serviceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.AuditConfigurationRequestDTO;
import com.example.audit_risk_management.dto.AuditConfigurationResponseDTO;
import com.example.audit_risk_management.model.AuditConfiguration;
import com.example.audit_risk_management.repository.AuditConfigurationRepository;
import com.example.audit_risk_management.service.AuditConfigurationService;

@Service
@Transactional
public class AuditConfigurationServiceImpl
        implements AuditConfigurationService {

    private final AuditConfigurationRepository repository;

    public AuditConfigurationServiceImpl(
            AuditConfigurationRepository repository) {

        this.repository = repository;
    }


    // =========================
    // GET CONFIGURATION
    // =========================

    @Override
    public AuditConfigurationResponseDTO getConfiguration() {
    
        AuditConfiguration configuration =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(this::createDefaultConfiguration);
    
        return convertToDTO(configuration);
    }
    // =========================
    // UPDATE CONFIGURATION
    // =========================

    @Override
    public AuditConfigurationResponseDTO updateConfiguration(
            AuditConfigurationRequestDTO request) {

        validateConfiguration(request);

        AuditConfiguration configuration =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(AuditConfiguration::new);

        configuration.setMinimumAuditDuration(
                request.getMinimumAuditDuration());

        configuration.setDefaultAuditDuration(
                request.getDefaultAuditDuration());

        configuration.setMaximumAuditDuration(
                request.getMaximumAuditDuration());

        configuration.setReminderDaysBeforeEnd(
                request.getReminderDaysBeforeEnd());

        configuration.setMaximumExtensions(
                request.getMaximumExtensions());

        configuration.setAllowOverdueAudit(
                request.getAllowOverdueAudit());

        configuration.setRequireCaeApproval(
                request.getRequireCaeApproval());

        configuration.setRequireManagerApproval(
                request.getRequireManagerApproval());

        AuditConfiguration saved =
                repository.save(configuration);

        return convertToDTO(saved);
    }


    // =========================
    // DEFAULT CONFIGURATION
    // =========================

    private AuditConfiguration createDefaultConfiguration() {

        AuditConfiguration configuration =
                new AuditConfiguration();

        configuration.setMinimumAuditDuration(1);

        configuration.setDefaultAuditDuration(30);

        configuration.setMaximumAuditDuration(90);

        configuration.setReminderDaysBeforeEnd(7);

        configuration.setMaximumExtensions(2);

        configuration.setAllowOverdueAudit(false);

        configuration.setRequireCaeApproval(true);

        configuration.setRequireManagerApproval(true);

        return repository.save(configuration);
    }


    // =========================
    // VALIDATION
    // =========================

    private void validateConfiguration(
            AuditConfigurationRequestDTO request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Audit configuration is required");
        }

        if (request.getMinimumAuditDuration() == null ||
            request.getDefaultAuditDuration() == null ||
            request.getMaximumAuditDuration() == null ||
            request.getReminderDaysBeforeEnd() == null ||
            request.getMaximumExtensions() == null ||
            request.getAllowOverdueAudit() == null ||
            request.getRequireCaeApproval() == null ||
            request.getRequireManagerApproval() == null) {

            throw new IllegalArgumentException(
                    "All audit configuration values are required");
        }


        if (request.getMinimumAuditDuration() < 1) {

            throw new IllegalArgumentException(
                    "Minimum audit duration must be at least 1 day");
        }


        if (request.getDefaultAuditDuration()
                < request.getMinimumAuditDuration()) {

            throw new IllegalArgumentException(
                    "Default duration cannot be less than minimum duration");
        }


        if (request.getMaximumAuditDuration()
                < request.getDefaultAuditDuration()) {

            throw new IllegalArgumentException(
                    "Maximum duration cannot be less than default duration");
        }


        if (request.getReminderDaysBeforeEnd() < 0) {

            throw new IllegalArgumentException(
                    "Reminder days cannot be negative");
        }


        if (request.getReminderDaysBeforeEnd()
                >= request.getMaximumAuditDuration()) {

            throw new IllegalArgumentException(
                    "Reminder days must be less than maximum audit duration");
        }


        if (request.getMaximumExtensions() < 0) {

            throw new IllegalArgumentException(
                    "Maximum extensions cannot be negative");
        }
    }


    // =========================
    // ENTITY → DTO
    // =========================

    private AuditConfigurationResponseDTO convertToDTO(
            AuditConfiguration configuration) {

        return new AuditConfigurationResponseDTO(

                configuration.getId(),

                configuration.getMinimumAuditDuration(),

                configuration.getDefaultAuditDuration(),

                configuration.getMaximumAuditDuration(),

                configuration.getReminderDaysBeforeEnd(),

                configuration.getMaximumExtensions(),

                configuration.getAllowOverdueAudit(),

                configuration.getRequireCaeApproval(),

                configuration.getRequireManagerApproval()
        );
    }
}