package com.example.audit_risk_management.dto;

import jakarta.validation.constraints.NotNull;

public class RiskAssignmentRequestDTO {

    @NotNull(message = "Internal Auditor ID is required")
    private Long auditorId;

    public RiskAssignmentRequestDTO() {
    }

    public Long getAuditorId() {
        return auditorId;
    }

    public void setAuditorId(Long auditorId) {
        this.auditorId = auditorId;
    }
}