package com.example.audit_risk_management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_configuration")
public class AuditConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Minimum allowed audit duration in days
    @Column(nullable = false)
    private Integer minimumAuditDuration;

    // Default audit duration in days
    @Column(nullable = false)
    private Integer defaultAuditDuration;

    // Maximum allowed audit duration in days
    @Column(nullable = false)
    private Integer maximumAuditDuration;

    // Number of days before end date to send reminder
    @Column(nullable = false)
    private Integer reminderDaysBeforeEnd;

    // Maximum number of extensions allowed
    @Column(nullable = false)
    private Integer maximumExtensions;

    // Whether overdue audits are allowed
    @Column(nullable = false)
    private Boolean allowOverdueAudit;

    // Whether CAE approval is required
    @Column(nullable = false)
    private Boolean requireCaeApproval;

    // Whether Audit Manager approval is required
    @Column(nullable = false)
    private Boolean requireManagerApproval;


    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public Integer getMinimumAuditDuration() {
        return minimumAuditDuration;
    }

    public Integer getDefaultAuditDuration() {
        return defaultAuditDuration;
    }

    public Integer getMaximumAuditDuration() {
        return maximumAuditDuration;
    }

    public Integer getReminderDaysBeforeEnd() {
        return reminderDaysBeforeEnd;
    }

    public Integer getMaximumExtensions() {
        return maximumExtensions;
    }

    public Boolean getAllowOverdueAudit() {
        return allowOverdueAudit;
    }

    public Boolean getRequireCaeApproval() {
        return requireCaeApproval;
    }

    public Boolean getRequireManagerApproval() {
        return requireManagerApproval;
    }


    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setMinimumAuditDuration(Integer minimumAuditDuration) {
        this.minimumAuditDuration = minimumAuditDuration;
    }

    public void setDefaultAuditDuration(Integer defaultAuditDuration) {
        this.defaultAuditDuration = defaultAuditDuration;
    }

    public void setMaximumAuditDuration(Integer maximumAuditDuration) {
        this.maximumAuditDuration = maximumAuditDuration;
    }

    public void setReminderDaysBeforeEnd(Integer reminderDaysBeforeEnd) {
        this.reminderDaysBeforeEnd = reminderDaysBeforeEnd;
    }

    public void setMaximumExtensions(Integer maximumExtensions) {
        this.maximumExtensions = maximumExtensions;
    }

    public void setAllowOverdueAudit(Boolean allowOverdueAudit) {
        this.allowOverdueAudit = allowOverdueAudit;
    }

    public void setRequireCaeApproval(Boolean requireCaeApproval) {
        this.requireCaeApproval = requireCaeApproval;
    }

    public void setRequireManagerApproval(Boolean requireManagerApproval) {
        this.requireManagerApproval = requireManagerApproval;
    }
}