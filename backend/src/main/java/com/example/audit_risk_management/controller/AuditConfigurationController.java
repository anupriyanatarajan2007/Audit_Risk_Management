package com.example.audit_risk_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.AuditConfigurationRequestDTO;
import com.example.audit_risk_management.dto.AuditConfigurationResponseDTO;
import com.example.audit_risk_management.service.AuditConfigurationService;

@RestController
@RequestMapping("/api/audit-configuration")
@CrossOrigin(origins = "*")
public class AuditConfigurationController {

    private final AuditConfigurationService service;

    public AuditConfigurationController(
            AuditConfigurationService service) {

        this.service = service;
    }


    // =========================================================
    // GET AUDIT CONFIGURATION
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_CONFIGURATION_VIEW')")
    public ResponseEntity<AuditConfigurationResponseDTO>
            getConfiguration() {

        return ResponseEntity.ok(
                service.getConfiguration()
        );
    }


    // =========================================================
    // UPDATE AUDIT CONFIGURATION
    // =========================================================

    @PutMapping
    @PreAuthorize("hasAuthority('AUDIT_CONFIGURATION_UPDATE')")
    public ResponseEntity<AuditConfigurationResponseDTO>
            updateConfiguration(
                    @RequestBody
                    AuditConfigurationRequestDTO request) {

        return ResponseEntity.ok(
                service.updateConfiguration(request)
        );
    }
}
