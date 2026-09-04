package com.example.audit_risk_management.dto;

public class AuditConfigurationRequestDTO {

    private Integer minimumAuditDuration;
    private Integer defaultAuditDuration;
    private Integer maximumAuditDuration;

    private Integer reminderDaysBeforeEnd;

    private Integer maximumExtensions;

    private Boolean allowOverdueAudit;

    private Boolean requireCaeApproval;

    private Boolean requireManagerApproval;


    public Integer getMinimumAuditDuration() {
        return minimumAuditDuration;
    }

    public void setMinimumAuditDuration(Integer minimumAuditDuration) {
        this.minimumAuditDuration = minimumAuditDuration;
    }

    public Integer getDefaultAuditDuration() {
        return defaultAuditDuration;
    }

    public void setDefaultAuditDuration(Integer defaultAuditDuration) {
        this.defaultAuditDuration = defaultAuditDuration;
    }

    public Integer getMaximumAuditDuration() {
        return maximumAuditDuration;
    }

    public void setMaximumAuditDuration(Integer maximumAuditDuration) {
        this.maximumAuditDuration = maximumAuditDuration;
    }

    public Integer getReminderDaysBeforeEnd() {
        return reminderDaysBeforeEnd;
    }

    public void setReminderDaysBeforeEnd(Integer reminderDaysBeforeEnd) {
        this.reminderDaysBeforeEnd = reminderDaysBeforeEnd;
    }

    public Integer getMaximumExtensions() {
        return maximumExtensions;
    }

    public void setMaximumExtensions(Integer maximumExtensions) {
        this.maximumExtensions = maximumExtensions;
    }

    public Boolean getAllowOverdueAudit() {
        return allowOverdueAudit;
    }

    public void setAllowOverdueAudit(Boolean allowOverdueAudit) {
        this.allowOverdueAudit = allowOverdueAudit;
    }

    public Boolean getRequireCaeApproval() {
        return requireCaeApproval;
    }

    public void setRequireCaeApproval(Boolean requireCaeApproval) {
        this.requireCaeApproval = requireCaeApproval;
    }

    public Boolean getRequireManagerApproval() {
        return requireManagerApproval;
    }

    public void setRequireManagerApproval(Boolean requireManagerApproval) {
        this.requireManagerApproval = requireManagerApproval;
    }
}