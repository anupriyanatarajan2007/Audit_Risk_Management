package com.example.audit_risk_management.serviceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.RiskConfigurationRequestDTO;
import com.example.audit_risk_management.dto.RiskConfigurationResponseDTO;
import com.example.audit_risk_management.model.RiskConfiguration;
import com.example.audit_risk_management.repository.RiskConfigurationRepository;
import com.example.audit_risk_management.service.RiskConfigurationService;

@Service
@Transactional
public class RiskConfigurationServiceImpl
        implements RiskConfigurationService {

    private final RiskConfigurationRepository repository;

    public RiskConfigurationServiceImpl(
            RiskConfigurationRepository repository) {

        this.repository = repository;
    }

    // ==========================================
    // GET CONFIGURATION
    // ==========================================

    @Override
    public RiskConfigurationResponseDTO getConfiguration() {

        RiskConfiguration configuration =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(this::createDefaultConfiguration);

        return convertToResponseDTO(configuration);
    }

    // ==========================================
    // UPDATE CONFIGURATION
    // ==========================================

    @Override
    public RiskConfigurationResponseDTO updateConfiguration(
            RiskConfigurationRequestDTO request) {

        validateConfiguration(request);

        RiskConfiguration configuration =
                repository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(RiskConfiguration::new);

        configuration.setLowMax(request.getLowMax());

        configuration.setMediumMin(request.getMediumMin());
        configuration.setMediumMax(request.getMediumMax());

        configuration.setHighMin(request.getHighMin());
        configuration.setHighMax(request.getHighMax());

        configuration.setCriticalMin(request.getCriticalMin());

        RiskConfiguration saved =
                repository.save(configuration);

        return convertToResponseDTO(saved);
    }

    // ==========================================
    // CREATE DEFAULT CONFIGURATION
    // ==========================================

    private RiskConfiguration createDefaultConfiguration() {

        RiskConfiguration configuration =
                new RiskConfiguration();

        configuration.setLowMax(5);

        configuration.setMediumMin(6);
        configuration.setMediumMax(11);

        configuration.setHighMin(12);
        configuration.setHighMax(19);

        configuration.setCriticalMin(20);

        return repository.save(configuration);
    }

    // ==========================================
    // VALIDATION
    // ==========================================

    private void validateConfiguration(
            RiskConfigurationRequestDTO request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Risk configuration is required");
        }

        if (request.getLowMax() == null ||
            request.getMediumMin() == null ||
            request.getMediumMax() == null ||
            request.getHighMin() == null ||
            request.getHighMax() == null ||
            request.getCriticalMin() == null) {

            throw new IllegalArgumentException(
                    "All risk score values are required");
        }

        // ======================================
        // RANGE: 1 - 25
        // ======================================

        if (request.getLowMax() < 1 ||
            request.getLowMax() > 25 ||

            request.getMediumMin() < 1 ||
            request.getMediumMin() > 25 ||

            request.getMediumMax() < 1 ||
            request.getMediumMax() > 25 ||

            request.getHighMin() < 1 ||
            request.getHighMin() > 25 ||

            request.getHighMax() < 1 ||
            request.getHighMax() > 25 ||

            request.getCriticalMin() < 1 ||
            request.getCriticalMin() > 25) {

            throw new IllegalArgumentException(
                    "Risk scores must be between 1 and 25");
        }

        // ======================================
        // LOW
        // ======================================

        if (request.getLowMax() >=
                request.getMediumMin()) {

            throw new IllegalArgumentException(
                    "Low and Medium risk ranges overlap");
        }

        // ======================================
        // MEDIUM
        // ======================================

        if (request.getMediumMin() >=
                request.getMediumMax()) {

            throw new IllegalArgumentException(
                    "Medium minimum must be less than Medium maximum");
        }

        if (request.getMediumMax() >=
                request.getHighMin()) {

            throw new IllegalArgumentException(
                    "Medium and High risk ranges overlap");
        }

        // ======================================
        // HIGH
        // ======================================

        if (request.getHighMin() >=
                request.getHighMax()) {

            throw new IllegalArgumentException(
                    "High minimum must be less than High maximum");
        }

        if (request.getHighMax() >=
                request.getCriticalMin()) {

            throw new IllegalArgumentException(
                    "High and Critical risk ranges overlap");
        }
    }

    // ==========================================
    // ENTITY → RESPONSE DTO
    // ==========================================

    private RiskConfigurationResponseDTO
            convertToResponseDTO(
                    RiskConfiguration configuration) {

        return new RiskConfigurationResponseDTO(

                configuration.getId(),

                configuration.getLowMax(),

                configuration.getMediumMin(),
                configuration.getMediumMax(),

                configuration.getHighMin(),
                configuration.getHighMax(),

                configuration.getCriticalMin()
        );
    }
}