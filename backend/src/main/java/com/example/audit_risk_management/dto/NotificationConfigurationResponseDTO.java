package com.example.audit_risk_management.dto;

public class NotificationConfigurationResponseDTO {

    private Long id;

    private Boolean emailNotificationsEnabled;

    private Boolean inAppNotificationsEnabled;

    private Boolean auditNotificationsEnabled;

    private Boolean riskNotificationsEnabled;

    private Boolean complianceNotificationsEnabled;

    private Boolean reminderNotificationsEnabled;

    private Integer reminderDaysBeforeDue;


    public NotificationConfigurationResponseDTO(
            Long id,
            Boolean emailNotificationsEnabled,
            Boolean inAppNotificationsEnabled,
            Boolean auditNotificationsEnabled,
            Boolean riskNotificationsEnabled,
            Boolean complianceNotificationsEnabled,
            Boolean reminderNotificationsEnabled,
            Integer reminderDaysBeforeDue) {

        this.id = id;
        this.emailNotificationsEnabled =
                emailNotificationsEnabled;
        this.inAppNotificationsEnabled =
                inAppNotificationsEnabled;
        this.auditNotificationsEnabled =
                auditNotificationsEnabled;
        this.riskNotificationsEnabled =
                riskNotificationsEnabled;
        this.complianceNotificationsEnabled =
                complianceNotificationsEnabled;
        this.reminderNotificationsEnabled =
                reminderNotificationsEnabled;
        this.reminderDaysBeforeDue =
                reminderDaysBeforeDue;
    }


    public Long getId() {
        return id;
    }

    public Boolean getEmailNotificationsEnabled() {
        return emailNotificationsEnabled;
    }

    public Boolean getInAppNotificationsEnabled() {
        return inAppNotificationsEnabled;
    }

    public Boolean getAuditNotificationsEnabled() {
        return auditNotificationsEnabled;
    }

    public Boolean getRiskNotificationsEnabled() {
        return riskNotificationsEnabled;
    }

    public Boolean getComplianceNotificationsEnabled() {
        return complianceNotificationsEnabled;
    }

    public Boolean getReminderNotificationsEnabled() {
        return reminderNotificationsEnabled;
    }

    public Integer getReminderDaysBeforeDue() {
        return reminderDaysBeforeDue;
    }
}