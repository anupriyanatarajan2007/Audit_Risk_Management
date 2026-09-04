package com.example.audit_risk_management.dto;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.ComplianceRuleStatus;

public class ComplianceRuleResponseDTO {

    private Long id;

    private String ruleCode;

    private String ruleName;

    private String description;

    private String ruleType;

    private String applicableDepartment;

    private String applicableProcess;

    private String controlRequirement;

    private String evidenceRequired;

    private String frequency;

    private ComplianceRuleStatus status;

    // Regulatory Requirement details
    private Long regulatoryRequirementId;

    private String regulatoryRequirementCode;

    private String regulatoryRequirementTitle;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public ComplianceRuleResponseDTO() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }


    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
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


    public String getControlRequirement() {
        return controlRequirement;
    }

    public void setControlRequirement(String controlRequirement) {
        this.controlRequirement = controlRequirement;
    }


    public String getEvidenceRequired() {
        return evidenceRequired;
    }

    public void setEvidenceRequired(String evidenceRequired) {
        this.evidenceRequired = evidenceRequired;
    }


    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }


    public ComplianceRuleStatus getStatus() {
        return status;
    }

    public void setStatus(ComplianceRuleStatus status) {
        this.status = status;
    }


    public Long getRegulatoryRequirementId() {
        return regulatoryRequirementId;
    }

    public void setRegulatoryRequirementId(Long regulatoryRequirementId) {
        this.regulatoryRequirementId = regulatoryRequirementId;
    }


    public String getRegulatoryRequirementCode() {
        return regulatoryRequirementCode;
    }

    public void setRegulatoryRequirementCode(String regulatoryRequirementCode) {
        this.regulatoryRequirementCode = regulatoryRequirementCode;
    }


    public String getRegulatoryRequirementTitle() {
        return regulatoryRequirementTitle;
    }

    public void setRegulatoryRequirementTitle(String regulatoryRequirementTitle) {
        this.regulatoryRequirementTitle = regulatoryRequirementTitle;
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