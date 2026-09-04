package com.example.audit_risk_management.dto;

public class AuditConfigurationResponseDTO {

    private Long id;

    private Integer minimumAuditDuration;
    private Integer defaultAuditDuration;
    private Integer maximumAuditDuration;

    private Integer reminderDaysBeforeEnd;

    private Integer maximumExtensions;

    private Boolean allowOverdueAudit;

    private Boolean requireCaeApproval;

    private Boolean requireManagerApproval;


    public AuditConfigurationResponseDTO() {
    }


    public AuditConfigurationResponseDTO(
            Long id,
            Integer minimumAuditDuration,
            Integer defaultAuditDuration,
            Integer maximumAuditDuration,
            Integer reminderDaysBeforeEnd,
            Integer maximumExtensions,
            Boolean allowOverdueAudit,
            Boolean requireCaeApproval,
            Boolean requireManagerApproval) {

        this.id = id;
        this.minimumAuditDuration = minimumAuditDuration;
        this.defaultAuditDuration = defaultAuditDuration;
        this.maximumAuditDuration = maximumAuditDuration;
        this.reminderDaysBeforeEnd = reminderDaysBeforeEnd;
        this.maximumExtensions = maximumExtensions;
        this.allowOverdueAudit = allowOverdueAudit;
        this.requireCaeApproval = requireCaeApproval;
        this.requireManagerApproval = requireManagerApproval;
    }


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
}