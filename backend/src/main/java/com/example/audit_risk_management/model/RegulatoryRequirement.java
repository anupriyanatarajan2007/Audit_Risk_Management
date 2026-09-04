package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.RegulatoryStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "regulatory_requirements")
public class RegulatoryRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String requirementCode;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String regulatoryBody;

    private String category;

    private String applicableDepartment;

    private String applicableProcess;

    private LocalDate effectiveDate;

    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private RegulatoryStatus status;

    private String complianceReference;

    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = RegulatoryStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public RegulatoryRequirement() {
    }

    public Long getId() {
        return id;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}