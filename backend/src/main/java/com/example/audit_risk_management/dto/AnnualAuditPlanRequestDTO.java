package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.User;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AnnualAuditPlanRequestDTO {

    // =========================
    // Basic Information
    // =========================

    @NotBlank(message = "Plan name is required")
    @Size(max = 255)
    private String planName;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Audit year is required")
    private Integer auditYear;

    @NotNull(message = "Planned start date is required")
    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDate plannedStartDate;

    @NotNull(message = "Planned end date is required")
    private LocalDate plannedEndDate;


    // =========================
    // Department Information
    // =========================

    @NotNull(message = "Department is required")
    private Department department;

    @NotBlank(message = "Business unit is required")
    private String businessUnit;

    @NotBlank(message = "Process name is required")
    private String processName;


    // =========================
    // Existing Risk
    // =========================

    @NotNull(message = "Risk ID is required")
    private Long riskId;


    // =========================
    // Status
    // =========================

    private AnnualAuditPlanStatus status;


    // =========================
    // Remarks
    // =========================

    @Size(max = 1000)
    private String remarks;


    // =========================
    // Constructors
    // =========================

    public AnnualAuditPlanRequestDTO() {
    }


    // =========================
    // Getters and Setters
    // =========================

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


    public Integer getAuditYear() {
        return auditYear;
    }

    public void setAuditYear(Integer auditYear) {
        this.auditYear = auditYear;
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


    public AnnualAuditPlanStatus getStatus() {
        return status;
    }

    public void setStatus(AnnualAuditPlanStatus status) {
        this.status = status;
    }


    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}

