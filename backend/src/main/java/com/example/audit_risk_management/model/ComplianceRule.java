package com.example.audit_risk_management.model;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.ComplianceRuleStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "compliance_rules")
public class ComplianceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ruleCode;

    @Column(nullable = false)
    private String ruleName;

    @Column(length = 3000)
    private String description;

    private String ruleType;

    private String applicableDepartment;

    private String applicableProcess;

    private String controlRequirement;

    private String evidenceRequired;

    private String frequency;

    @Enumerated(EnumType.STRING)
    private ComplianceRuleStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regulatory_requirement_id")
    private RegulatoryRequirement regulatoryRequirement;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = ComplianceRuleStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ComplianceRule() {
    }

    public Long getId() {
        return id;
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

    public RegulatoryRequirement getRegulatoryRequirement() {
        return regulatoryRequirement;
    }

    public void setRegulatoryRequirement(
            RegulatoryRequirement regulatoryRequirement) {
        this.regulatoryRequirement = regulatoryRequirement;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}