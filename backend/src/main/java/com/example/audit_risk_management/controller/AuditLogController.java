
package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.AuditLogResponseDTO;
import com.example.audit_risk_management.service.AuditLogService;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }


    // =========================================================
    // GET ALL AUDIT LOGS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    public ResponseEntity<List<AuditLogResponseDTO>> getAllLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllLogs()
        );
    }


    // =========================================================
    // GET LOGS BY USER
    // =========================================================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_USER_VIEW')")
    public ResponseEntity<List<AuditLogResponseDTO>> getLogsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                auditLogService.getLogsByUser(userId)
        );
    }


    // =========================================================
    // GET LOGS BY MODULE
    // =========================================================

    @GetMapping("/module/{module}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_MODULE_VIEW')")
    public ResponseEntity<List<AuditLogResponseDTO>> getLogsByModule(
            @PathVariable String module) {

        return ResponseEntity.ok(
                auditLogService.getLogsByModule(module)
        );
    }


    // =========================================================
    // GET LOGS BY ACTION
    // =========================================================

    @GetMapping("/action/{action}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_ACTION_VIEW')")
    public ResponseEntity<List<AuditLogResponseDTO>> getLogsByAction(
            @PathVariable String action) {

        return ResponseEntity.ok(
                auditLogService.getLogsByAction(action)
        );
    }
}
