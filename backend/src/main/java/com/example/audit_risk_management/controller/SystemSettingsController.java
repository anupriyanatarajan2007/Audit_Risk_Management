
package com.example.audit_risk_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.SystemSettingsRequestDTO;
import com.example.audit_risk_management.dto.SystemSettingsResponseDTO;
import com.example.audit_risk_management.service.SystemSettingsService;

@RestController
@RequestMapping("/api/admin/system-settings")
public class SystemSettingsController {

    private final SystemSettingsService service;

    public SystemSettingsController(
            SystemSettingsService service) {

        this.service = service;
    }

    // =========================================================
    // GET SYSTEM SETTINGS
    // Permission: SYSTEM_SETTINGS_VIEW
    // =========================================================

    @PreAuthorize("hasAuthority('SYSTEM_SETTINGS_VIEW')")
    @GetMapping
    public ResponseEntity<SystemSettingsResponseDTO> getSettings() {

        return ResponseEntity.ok(
                service.getSettings()
        );
    }

    // =========================================================
    // UPDATE SYSTEM SETTINGS
    // Permission: SYSTEM_SETTINGS_UPDATE
    // =========================================================

    @PreAuthorize("hasAuthority('SYSTEM_SETTINGS_UPDATE')")
    @PutMapping
    public ResponseEntity<SystemSettingsResponseDTO> updateSettings(
            @RequestBody SystemSettingsRequestDTO request) {

        return ResponseEntity.ok(
                service.updateSettings(request)
        );
    }
}
