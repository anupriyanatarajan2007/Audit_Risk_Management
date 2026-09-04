package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuditCommitmentRequest {

    @NotNull(message = "Auditee ID is required")
    private Long auditeeId;

    @NotNull(message = "Audit ID is required")
    private Long auditId;

    @NotBlank(message = "Commitment type is required")
    private String commitmentType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotBlank(message = "Status is required")
    private String status;

    public AuditCommitmentRequest() {
    }

    public Long getAuditeeId() {
        return auditeeId;
    }

    public void setAuditeeId(Long auditeeId) {
        this.auditeeId = auditeeId;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public String getCommitmentType() {
        return commitmentType;
    }

    public void setCommitmentType(String commitmentType) {
        this.commitmentType = commitmentType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
