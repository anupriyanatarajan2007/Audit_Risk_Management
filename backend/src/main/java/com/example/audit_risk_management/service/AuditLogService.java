package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.AuditLogResponseDTO;
import com.example.audit_risk_management.model.User;

public interface AuditLogService {

    // Create audit log internally
    AuditLogResponseDTO createLog(
            User user,
            String module,
            String action,
            String description
    );

    // Get all audit logs
    List<AuditLogResponseDTO> getAllLogs();

    // Get logs by user
    List<AuditLogResponseDTO> getLogsByUser(Long userId);

    // Get logs by module
    List<AuditLogResponseDTO> getLogsByModule(String module);

    // Get logs by action
    List<AuditLogResponseDTO> getLogsByAction(String action);
}