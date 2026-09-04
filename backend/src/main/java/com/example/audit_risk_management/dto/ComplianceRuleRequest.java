package com.example.audit_risk_management.dto;

public class ComplianceRuleRequest {

    private String ruleCode;
    private String ruleName;
    private String description;
    private String ruleType;
    private String applicableDepartment;
    private String applicableProcess;
    private String controlRequirement;
    private String evidenceRequired;
    private String frequency;
    private Long regulatoryRequirementId;

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

    public Long getRegulatoryRequirementId() {
        return regulatoryRequirementId;
    }

    public void setRegulatoryRequirementId(Long regulatoryRequirementId) {
        this.regulatoryRequirementId = regulatoryRequirementId;
    }
}