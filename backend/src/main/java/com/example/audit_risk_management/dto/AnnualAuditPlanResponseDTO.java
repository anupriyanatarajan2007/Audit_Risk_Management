package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.User;

public class AnnualAuditPlanResponseDTO {

    // =========================
    // Basic Information
    // =========================

    private Long id;
    private String planId;

    private Integer planYear;

    private String planName;
    private String description;

    // =========================
    // Date Information
    // =========================

    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;

    // =========================
    // Department Information
    // =========================

    private Department department;

    private String businessUnit;
    private String processName;

    // =========================
    // Risk Information
    // =========================

    private Long riskId;
    private List<Long> riskIds;

    // =========================
    // Status
    // =========================

    private AnnualAuditPlanStatus status;

    // =========================
    // Audit Manager
    // =========================

    private Long auditManagerId;
    private String auditManagerName;

    // =========================
    // Remarks
    // =========================

    private String remarks;

    private String rejectionReason;

    // =========================
    // Audit Information
    // =========================

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    // =========================
    // Getters and Setters
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getPlanId() {
        return planId;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }


    public Integer getPlanYear() {
        return planYear;
    }

    public void setPlanYear(Integer planYear) {
        this.planYear = planYear;
    }


    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public LocalDate getPlannedStartDate() {
        return plannedStartDate;
    }

    public void setPlannedStartDate(LocalDate plannedStartDate) {
        this.plannedStartDate = plannedStartDate;
    }


    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }

    public void setPlannedEndDate(LocalDate plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
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


    public Long getRiskId() {
        return riskId;
    }

    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }


    public List<Long> getRiskIds() {
        return riskIds;
    }

    public void setRiskIds(List<Long> riskIds) {
        this.riskIds = riskIds;
    }


    public AnnualAuditPlanStatus getStatus() {
        return status;
    }

    public void setStatus(AnnualAuditPlanStatus status) {
        this.status = status;
    }


    public Long getAuditManagerId() {
        return auditManagerId;
    }

    public void setAuditManagerId(Long auditManagerId) {
        this.auditManagerId = auditManagerId;
    }


    public String getAuditManagerName() {
        return auditManagerName;
    }

    public void setAuditManagerName(String auditManagerName) {
        this.auditManagerName = auditManagerName;
    }


    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }


    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
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