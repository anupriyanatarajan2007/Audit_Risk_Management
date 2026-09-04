package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public class AuditeeAssignmentRequestDTO {


    @NotNull(message = "Audit ID is required")
    private Long auditId;


    @NotNull(message = "Auditee ID is required")
    private Long auditeeId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDate startDate;

    @NotNull(message = "Due date is required")
    @FutureOrPresent(message = "Due date cannot be in the past")
    private LocalDate dueDate;

    public Long getAuditId() {
        return auditId;
    }

    public Long getAuditeeId() {
        return auditeeId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public void setAuditeeId(Long auditeeId) {
        this.auditeeId = auditeeId;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}