package com.example.audit_risk_management.dto;

import java.time.LocalDate;

public class AuditCommitmentResponse {

    private Long id;

    // Auditor
    private Long auditorId;
    private String auditorName;

    // Auditee
    private Long auditeeId;
    private String auditeeName;

    // Audit
    private Long auditId;
    private String auditName;

    private String commitmentType;

    private LocalDate startDate;
    private LocalDate dueDate;

    private String status;

    public AuditCommitmentResponse() {
    }

    public AuditCommitmentResponse(
            Long id,
            Long auditorId,
            String auditorName,
            Long auditeeId,
            String auditeeName,
            Long auditId,
            String auditName,
            String commitmentType,
            LocalDate startDate,
            LocalDate dueDate,
            String status) {

        this.id = id;

        this.auditorId = auditorId;
        this.auditorName = auditorName;

        this.auditeeId = auditeeId;
        this.auditeeName = auditeeName;

        this.auditId = auditId;
        this.auditName = auditName;

        this.commitmentType = commitmentType;

        this.startDate = startDate;
        this.dueDate = dueDate;

        this.status = status;
    }

    // ============================================================
    // ID
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // ============================================================
    // AUDITOR
    // ============================================================

    public Long getAuditorId() {
        return auditorId;
    }

    public void setAuditorId(Long auditorId) {
        this.auditorId = auditorId;
    }

    public String getAuditorName() {
        return auditorName;
    }

    public void setAuditorName(String auditorName) {
        this.auditorName = auditorName;
    }

    // ============================================================
    // AUDITEE
    // ============================================================

    public Long getAuditeeId() {
        return auditeeId;
    }

    public void setAuditeeId(Long auditeeId) {
        this.auditeeId = auditeeId;
    }

    public String getAuditeeName() {
        return auditeeName;
    }

    public void setAuditeeName(String auditeeName) {
        this.auditeeName = auditeeName;
    }

    // ============================================================
    // AUDIT
    // ============================================================

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public String getAuditName() {
        return auditName;
    }

    public void setAuditName(String auditName) {
        this.auditName = auditName;
    }

    // ============================================================
    // COMMITMENT
    // ============================================================

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
