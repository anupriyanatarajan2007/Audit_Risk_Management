package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.AuditStatus;
import com.example.audit_risk_management.model.Department;

public class AuditResponseDTO {

    private Long id;

    private String auditId;

    private String riskId;

    private String riskTitle;

    private String auditName;

    private String description;

    private Department department;

    private String businessUnit;

    private String processName;

    private LocalDate startDate;

    private LocalDate endDate;

    private AuditStatus status;

    private Long internalAuditorId;

    private String internalAuditorName;

    private Long auditeeId;

    private String auditeeName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // ================= GETTERS =================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuditId() {
        return auditId;
    }

    public void setAuditId(String auditId) {
        this.auditId = auditId;
    }

    public String getRiskId() {
        return riskId;
    }

    public void setRiskId(String riskId) {
        this.riskId = riskId;
    }

    public String getRiskTitle() {
        return riskTitle;
    }

    public void setRiskTitle(String riskTitle) {
        this.riskTitle = riskTitle;
    }

    public String getAuditName() {
        return auditName;
    }

    public void setAuditName(String auditName) {
        this.auditName = auditName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(String businessUnit) {
        this.businessUnit = businessUnit;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public AuditStatus getStatus() {
        return status;
    }

    public void setStatus(AuditStatus status) {
        this.status = status;
    }

    public Long getInternalAuditorId() {
        return internalAuditorId;
    }

    public void setInternalAuditorId(Long internalAuditorId) {
        this.internalAuditorId = internalAuditorId;
    }

    public String getInternalAuditorName() {
        return internalAuditorName;
    }

    public void setInternalAuditorName(String internalAuditorName) {
        this.internalAuditorName = internalAuditorName;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}