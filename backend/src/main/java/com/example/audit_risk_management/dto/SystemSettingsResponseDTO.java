package com.example.audit_risk_management.dto;

public class SystemSettingsResponseDTO {

    private Long id;

    private String systemName;
    private String timezone;
    private String dateFormat;

    private Boolean maintenanceMode;

    private Integer sessionTimeoutMinutes;

    private Integer maxLoginAttempts;

    private Integer passwordExpiryDays;

    private Boolean enableAuditLogs;


    public SystemSettingsResponseDTO(
            Long id,
            String systemName,
            String timezone,
            String dateFormat,
            Boolean maintenanceMode,
            Integer sessionTimeoutMinutes,
            Integer maxLoginAttempts,
            Integer passwordExpiryDays,
            Boolean enableAuditLogs) {

        this.id = id;
        this.systemName = systemName;
        this.timezone = timezone;
        this.dateFormat = dateFormat;
        this.maintenanceMode = maintenanceMode;
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
        this.maxLoginAttempts = maxLoginAttempts;
        this.passwordExpiryDays = passwordExpiryDays;
        this.enableAuditLogs = enableAuditLogs;
    }


    public Long getId() {
        return id;
    }

    public String getSystemName() {
        return systemName;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public Integer getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public Integer getMaxLoginAttempts() {
        return maxLoginAttempts;
    }

    public Integer getPasswordExpiryDays() {
        return passwordExpiryDays;
    }

    public Boolean getEnableAuditLogs() {
        return enableAuditLogs;
    }
}