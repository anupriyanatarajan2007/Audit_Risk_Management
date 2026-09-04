package com.example.audit_risk_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.RiskConfigurationRequestDTO;
import com.example.audit_risk_management.dto.RiskConfigurationResponseDTO;
import com.example.audit_risk_management.service.RiskConfigurationService;

@RestController
@RequestMapping("/api/risk-configuration")
@CrossOrigin(origins = "*")
public class RiskConfigurationController {

    private final RiskConfigurationService riskConfigurationService;

    public RiskConfigurationController(
            RiskConfigurationService riskConfigurationService) {
        this.riskConfigurationService = riskConfigurationService;
    }

    // ==========================================
    // GET RISK CONFIGURATION
    // ==========================================

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<RiskConfigurationResponseDTO> getConfiguration() {

        RiskConfigurationResponseDTO configuration =
                riskConfigurationService.getConfiguration();

        return ResponseEntity.ok(configuration);
    }

    // ==========================================
    // UPDATE RISK CONFIGURATION
    // ==========================================

    @PutMapping
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<RiskConfigurationResponseDTO> updateConfiguration(
            @RequestBody RiskConfigurationRequestDTO request) {

        RiskConfigurationResponseDTO updatedConfiguration =
                riskConfigurationService.updateConfiguration(request);

        return ResponseEntity.ok(updatedConfiguration);
    }
}