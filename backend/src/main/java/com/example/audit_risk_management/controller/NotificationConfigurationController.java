package com.example.audit_risk_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.NotificationConfigurationRequestDTO;
import com.example.audit_risk_management.dto.NotificationConfigurationResponseDTO;
import com.example.audit_risk_management.service.NotificationConfigurationService;

@RestController
@RequestMapping("/api/admin/notification-configuration")
public class NotificationConfigurationController {

    private final NotificationConfigurationService service;

    public NotificationConfigurationController(
            NotificationConfigurationService service) {

        this.service = service;
    }


  @GetMapping
@PreAuthorize("hasAuthority('NOTIFICATION_CONFIGURATION_VIEW')")
public ResponseEntity<NotificationConfigurationResponseDTO>
getConfiguration() {
    return ResponseEntity.ok(
        service.getConfiguration()
    );
}


    // =========================================================
    // UPDATE NOTIFICATION CONFIGURATION
    // SYSTEM ADMINISTRATOR ONLY
    // =========================================================

    @PutMapping
@PreAuthorize("hasAuthority('NOTIFICATION_CONFIGURATION_UPDATE')")
public ResponseEntity<NotificationConfigurationResponseDTO>
updateConfiguration(
        @RequestBody NotificationConfigurationRequestDTO request) {

    return ResponseEntity.ok(
        service.updateConfiguration(request)
    );
}
}