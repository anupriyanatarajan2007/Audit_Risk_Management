package com.example.audit_risk_management.dto;

public class SystemSettingsRequestDTO {

    private String systemName;
    private String timezone;
    private String dateFormat;

    private Boolean maintenanceMode;

    private Integer sessionTimeoutMinutes;

    private Integer maxLoginAttempts;

    private Integer passwordExpiryDays;

    private Boolean enableAuditLogs;


    public String getSystemName() {
        return systemName;
    }

    public void setSystemName(String systemName) {
        this.systemName = systemName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public Integer getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(Integer sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public Integer getMaxLoginAttempts() {
        return maxLoginAttempts;
    }

    public void setMaxLoginAttempts(Integer maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }

    public Integer getPasswordExpiryDays() {
        return passwordExpiryDays;
    }

    public void setPasswordExpiryDays(Integer passwordExpiryDays) {
        this.passwordExpiryDays = passwordExpiryDays;
    }

    public Boolean getEnableAuditLogs() {
        return enableAuditLogs;
    }

    public void setEnableAuditLogs(Boolean enableAuditLogs) {
        this.enableAuditLogs = enableAuditLogs;
    }
}