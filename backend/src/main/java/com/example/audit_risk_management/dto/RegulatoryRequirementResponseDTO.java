package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.RegulatoryStatus;

public class RegulatoryRequirementResponseDTO {

    private Long id;

    private String requirementCode;
    private String title;
    private String description;
    private String regulatoryBody;
    private String category;
    private String applicableDepartment;
    private String applicableProcess;

    private LocalDate effectiveDate;
    private LocalDate expiryDate;

    private RegulatoryStatus status;

    private String complianceReference;
    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RegulatoryRequirementResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequirementCode() {
        return requirementCode;
    }

    public void setRequirementCode(String requirementCode) {
        this.requirementCode = requirementCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRegulatoryBody() {
        return regulatoryBody;
    }

    public void setRegulatoryBody(String regulatoryBody) {
        this.regulatoryBody = regulatoryBody;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getApplicableDepartment() {
        return applicableDepartment;
    }

    public void setApplicableDepartment(String applicableDepartment) {
        this.applicableDepartment = applicableDepartment;
    }

    public String getApplicableProcess() {
        return applicableProcess;
    }

    public void setApplicableProcess(String applicableProcess) {
        this.applicableProcess = applicableProcess;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public RegulatoryStatus getStatus() {
        return status;
    }

    public void setStatus(RegulatoryStatus status) {
        this.status = status;
    }

    public String getComplianceReference() {
        return complianceReference;
    }

    public void setComplianceReference(String complianceReference) {
        this.complianceReference = complianceReference;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ✅ MISSING METHOD
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // ✅ MISSING METHOD
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}