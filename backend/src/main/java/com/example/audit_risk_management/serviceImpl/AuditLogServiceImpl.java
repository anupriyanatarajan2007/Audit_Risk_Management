package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.AuditLogResponseDTO;
import com.example.audit_risk_management.model.AuditLog;
import com.example.audit_risk_management.model.SystemSettings;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditLogRepository;
import com.example.audit_risk_management.repository.SystemSettingsRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.AuditLogService;

@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepo userRepository;
    private final SystemSettingsRepository systemSettingsRepository;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository,
            UserRepo userRepository,
            SystemSettingsRepository systemSettingsRepository) {

        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.systemSettingsRepository = systemSettingsRepository;
    }

    // =========================================================
    // GET SYSTEM SETTINGS
    // =========================================================

    private SystemSettings getSystemSettings() {

        return systemSettingsRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
    }

    // =========================================================
    // CREATE DEFAULT SETTINGS
    // =========================================================

    private SystemSettings createDefaultSettings() {

        SystemSettings settings = new SystemSettings();

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

        return systemSettingsRepository.save(settings);
    }

    // =========================================================
    // CREATE AUDIT LOG
    // =========================================================

    @Override
    public AuditLogResponseDTO createLog(
            User user,
            String module,
            String action,
            String description) {

        // -----------------------------------------------------
        // Validate user
        // -----------------------------------------------------

        if (user == null) {
            throw new IllegalArgumentException(
                    "User is required"
            );
        }

        // -----------------------------------------------------
        // Validate module
        // -----------------------------------------------------

        if (module == null || module.isBlank()) {
            throw new IllegalArgumentException(
                    "Module is required"
            );
        }

        // -----------------------------------------------------
        // Validate action
        // -----------------------------------------------------

        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException(
                    "Action is required"
            );
        }

        // -----------------------------------------------------
        // Check Audit Log setting
        // -----------------------------------------------------

        SystemSettings settings = getSystemSettings();

        Boolean auditLogsEnabled =
                settings.getEnableAuditLogs();

        // -----------------------------------------------------
        // If audit logging is disabled,
        // do NOT create a database record.
        // -----------------------------------------------------

        if (Boolean.FALSE.equals(auditLogsEnabled)) {

            return null;
        }

        // -----------------------------------------------------
        // Create AuditLog entity
        // -----------------------------------------------------

        AuditLog auditLog = new AuditLog();

        auditLog.setUser(user);
        auditLog.setModule(module.trim());
        auditLog.setAction(action.trim());
        auditLog.setDescription(description);

        // Timestamp is automatically created by
        // @PrePersist inside AuditLog entity.

        AuditLog savedLog =
                auditLogRepository.save(auditLog);

        return mapToDTO(savedLog);
    }

    // =========================================================
    // GET ALL LOGS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getAllLogs() {

        return auditLogRepository
                .findAllByOrderByTimestampDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET LOGS BY USER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getLogsByUser(
            Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return auditLogRepository
                .findByUserOrderByTimestampDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET LOGS BY MODULE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getLogsByModule(
            String module) {

        if (module == null || module.isBlank()) {
            throw new IllegalArgumentException(
                    "Module is required"
            );
        }

        return auditLogRepository
                .findByModuleOrderByTimestampDesc(
                        module.trim()
                )
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET LOGS BY ACTION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getLogsByAction(
            String action) {

        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException(
                    "Action is required"
            );
        }

        return auditLogRepository
                .findByActionOrderByTimestampDesc(
                        action.trim()
                )
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private AuditLogResponseDTO mapToDTO(
            AuditLog auditLog) {

        AuditLogResponseDTO dto =
                new AuditLogResponseDTO();

        dto.setId(
                auditLog.getId()
        );

        // -----------------------------------------------------
        // User information
        // -----------------------------------------------------

        if (auditLog.getUser() != null) {

            User user =
                    auditLog.getUser();

            dto.setUserId(
                    user.getId()
            );

            // -------------------------------------------------
            // Profile name
            // -------------------------------------------------

            if (user.getProfile() != null) {

                String firstName =
                        user.getProfile().getFirstName();

                String lastName =
                        user.getProfile().getLastName();

                if (firstName == null) {
                    firstName = "";
                }

                if (lastName == null) {
                    lastName = "";
                }

                dto.setUserName(
                        (firstName + " " + lastName)
                                .trim()
                );

            } else {

                dto.setUserName(
                        user.getEmail()
                );
            }
        }

        // -----------------------------------------------------
        // Log information
        // -----------------------------------------------------

        dto.setModule(
                auditLog.getModule()
        );

        dto.setAction(
                auditLog.getAction()
        );

        dto.setDescription(
                auditLog.getDescription()
        );

        dto.setTimestamp(
                auditLog.getTimestamp()
        );

        return dto;
    }
}
