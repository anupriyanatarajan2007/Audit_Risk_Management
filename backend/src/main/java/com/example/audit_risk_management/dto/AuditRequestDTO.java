package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.User;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuditRequestDTO {

    @NotBlank(message = "Risk ID is required")
    private String riskId;

    @Size(
        min = 3,
        max = 100,
        message = "Audit name must be between 3 and 100 characters"
    )
    private String auditTitle;

    @Size(
        max = 500,
        message = "Description cannot exceed 500 characters"
    )
    private String description;

    private Department department;

    @Size(
        max = 100,
        message = "Business Unit cannot exceed 100 characters"
    )
    private String businessUnit;

    @Size(
        max = 100,
        message = "Process Name cannot exceed 100 characters"
    )
    private String processName;

    @NotNull(message = "Start Date is required")
    @FutureOrPresent(
        message = "Start Date cannot be in the past"
    )
    private LocalDate startDate;

    @NotNull(message = "End Date is required")
    @Future(
        message = "End Date must be in the future"
    )
    private LocalDate endDate;


    // ================= GETTERS =================

    public String getRiskId() {
        return riskId;
    }

    public void setRiskId(String riskId) {
        this.riskId = riskId;
    }

    public String getAuditTitle() {
        return auditTitle;
    }

    public void setAuditTitle(String auditTitle) {
        this.auditTitle = auditTitle;
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
}