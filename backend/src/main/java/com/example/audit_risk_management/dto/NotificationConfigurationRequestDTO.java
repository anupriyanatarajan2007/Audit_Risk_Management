package com.example.audit_risk_management.dto;

public class NotificationConfigurationRequestDTO {

    private Boolean emailNotificationsEnabled;

    private Boolean inAppNotificationsEnabled;

    private Boolean auditNotificationsEnabled;

    private Boolean riskNotificationsEnabled;

    private Boolean complianceNotificationsEnabled;

    private Boolean reminderNotificationsEnabled;

    private Integer reminderDaysBeforeDue;


    public Boolean getEmailNotificationsEnabled() {
        return emailNotificationsEnabled;
    }

    public void setEmailNotificationsEnabled(
            Boolean emailNotificationsEnabled) {

        this.emailNotificationsEnabled =
                emailNotificationsEnabled;
    }


    public Boolean getInAppNotificationsEnabled() {
        return inAppNotificationsEnabled;
    }

    public void setInAppNotificationsEnabled(
            Boolean inAppNotificationsEnabled) {

        this.inAppNotificationsEnabled =
                inAppNotificationsEnabled;
    }


    public Boolean getAuditNotificationsEnabled() {
        return auditNotificationsEnabled;
    }

    public void setAuditNotificationsEnabled(
            Boolean auditNotificationsEnabled) {

        this.auditNotificationsEnabled =
                auditNotificationsEnabled;
    }


    public Boolean getRiskNotificationsEnabled() {
        return riskNotificationsEnabled;
    }

    public void setRiskNotificationsEnabled(
            Boolean riskNotificationsEnabled) {

        this.riskNotificationsEnabled =
                riskNotificationsEnabled;
    }


    public Boolean getComplianceNotificationsEnabled() {
        return complianceNotificationsEnabled;
    }

    public void setComplianceNotificationsEnabled(
            Boolean complianceNotificationsEnabled) {

        this.complianceNotificationsEnabled =
                complianceNotificationsEnabled;
    }


    public Boolean getReminderNotificationsEnabled() {
        return reminderNotificationsEnabled;
    }

    public void setReminderNotificationsEnabled(
            Boolean reminderNotificationsEnabled) {

        this.reminderNotificationsEnabled =
                reminderNotificationsEnabled;
    }


    public Integer getReminderDaysBeforeDue() {
        return reminderDaysBeforeDue;
    }

    public void setReminderDaysBeforeDue(
            Integer reminderDaysBeforeDue) {

        this.reminderDaysBeforeDue =
                reminderDaysBeforeDue;
    }
}