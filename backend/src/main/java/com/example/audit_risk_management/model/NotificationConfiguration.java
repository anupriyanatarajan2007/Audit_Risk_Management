package com.example.audit_risk_management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notification_configuration")
public class NotificationConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Email notifications enabled/disabled
    @Column(nullable = false)
    private Boolean emailNotificationsEnabled;

    // In-app notifications enabled/disabled
    @Column(nullable = false)
    private Boolean inAppNotificationsEnabled;

    // Audit related notifications
    @Column(nullable = false)
    private Boolean auditNotificationsEnabled;

    // Risk related notifications
    @Column(nullable = false)
    private Boolean riskNotificationsEnabled;

    // Compliance related notifications
    @Column(nullable = false)
    private Boolean complianceNotificationsEnabled;

    // Reminder notifications
    @Column(nullable = false)
    private Boolean reminderNotificationsEnabled;

    // Number of days before due date
    @Column(nullable = false)
    private Integer reminderDaysBeforeDue;


    // =========================
    // GETTERS
    // =========================

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


    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmailNotificationsEnabled(
            Boolean emailNotificationsEnabled) {

        this.emailNotificationsEnabled =
                emailNotificationsEnabled;
    }

    public void setInAppNotificationsEnabled(
            Boolean inAppNotificationsEnabled) {

        this.inAppNotificationsEnabled =
                inAppNotificationsEnabled;
    }

    public void setAuditNotificationsEnabled(
            Boolean auditNotificationsEnabled) {

        this.auditNotificationsEnabled =
                auditNotificationsEnabled;
    }

    public void setRiskNotificationsEnabled(
            Boolean riskNotificationsEnabled) {

        this.riskNotificationsEnabled =
                riskNotificationsEnabled;
    }

    public void setComplianceNotificationsEnabled(
            Boolean complianceNotificationsEnabled) {

        this.complianceNotificationsEnabled =
                complianceNotificationsEnabled;
    }

    public void setReminderNotificationsEnabled(
            Boolean reminderNotificationsEnabled) {

        this.reminderNotificationsEnabled =
                reminderNotificationsEnabled;
    }

    public void setReminderDaysBeforeDue(
            Integer reminderDaysBeforeDue) {

        this.reminderDaysBeforeDue =
                reminderDaysBeforeDue;
    }
}