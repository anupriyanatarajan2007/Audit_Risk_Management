package com.example.audit_risk_management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // System name
    @Column(nullable = false, length = 150)
    private String systemName;

    // Example: Asia/Kolkata
    @Column(nullable = false, length = 100)
    private String timezone;

    // Example: dd-MM-yyyy
    @Column(nullable = false, length = 50)
    private String dateFormat;

    // Enable / disable maintenance mode
    @Column(nullable = false)
    private Boolean maintenanceMode;

    // Session timeout in minutes
    @Column(nullable = false)
    private Integer sessionTimeoutMinutes;

    // Maximum failed login attempts
    @Column(nullable = false)
    private Integer maxLoginAttempts;

    // Password expiry period in days
    @Column(nullable = false)
    private Integer passwordExpiryDays;

    // Enable / disable audit logging
    @Column(nullable = false)
    private Boolean enableAuditLogs;


    // =========================
    // CONSTRUCTOR
    // =========================

    public SystemSettings() {
    }


    // =========================
    // GETTERS
    // =========================

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


    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setSystemName(String systemName) {
        this.systemName = systemName;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public void setSessionTimeoutMinutes(Integer sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public void setMaxLoginAttempts(Integer maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }

    public void setPasswordExpiryDays(Integer passwordExpiryDays) {
        this.passwordExpiryDays = passwordExpiryDays;
    }

    public void setEnableAuditLogs(Boolean enableAuditLogs) {
        this.enableAuditLogs = enableAuditLogs;
    }
}