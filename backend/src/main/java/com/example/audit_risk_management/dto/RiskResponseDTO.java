package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.Impact;
import com.example.audit_risk_management.enums.Likelihood;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.enums.RiskStatus;
import com.example.audit_risk_management.model.Department;

public class RiskResponseDTO {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    private Long id;

    private String riskId;


    // =========================================================
    // BASIC INFORMATION
    // =========================================================

    private String title;

    private String description;

    private Department department;

    private String businessUnit;

    private String processName;

    private String remarks;


    // =========================================================
    // RISK ASSESSMENT
    // =========================================================

    private RiskCategory category;

    private Likelihood likelihood;

    private Impact impact;

    private Integer riskScore;

    private RiskLevel level;


    // =========================================================
    // CONTROLS / MITIGATION
    // =========================================================

    private String controlOwner;

    private String existingControls;

    private String mitigationPlan;

    private LocalDate targetClosureDate;


    // =========================================================
    // AUDITEE / MITIGATION UPDATES
    // =========================================================

    private String mitigationUpdate;

    private LocalDate actualClosureDate;


    // =========================================================
    // STATUS
    // =========================================================

    private RiskStatus status;


    // =========================================================
    // USERS
    // =========================================================

    private Long identifiedById;

    private String identifiedByName;

    private Long assignedToId;

    private String assignedToName;


    // =========================================================
    // TIMESTAMPS
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public RiskResponseDTO() {
    }


    // =========================================================
    // PARAMETERIZED CONSTRUCTOR
    // =========================================================

    public RiskResponseDTO(
            Long id,
            String riskId,
            String title,
            String description,
            Department department,
            String businessUnit,
            String processName,
            String remarks,
            RiskCategory category,
            Likelihood likelihood,
            Impact impact,
            Integer riskScore,
            RiskLevel level,
            String controlOwner,
            String existingControls,
            String mitigationPlan,
            LocalDate targetClosureDate,
            String mitigationUpdate,
            LocalDate actualClosureDate,
            RiskStatus status,
            Long identifiedById,
            String identifiedByName,
            Long assignedToId,
            String assignedToName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.riskId = riskId;
        this.title = title;
        this.description = description;
        this.department = department;
        this.businessUnit = businessUnit;
        this.processName = processName;
        this.remarks = remarks;
        this.category = category;
        this.likelihood = likelihood;
        this.impact = impact;
        this.riskScore = riskScore;
        this.level = level;
        this.controlOwner = controlOwner;
        this.existingControls = existingControls;
        this.mitigationPlan = mitigationPlan;
        this.targetClosureDate = targetClosureDate;
        this.mitigationUpdate = mitigationUpdate;
        this.actualClosureDate = actualClosureDate;
        this.status = status;
        this.identifiedById = identifiedById;
        this.identifiedByName = identifiedByName;
        this.assignedToId = assignedToId;
        this.assignedToName = assignedToName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRiskId() {
        return riskId;
    }

    public void setRiskId(String riskId) {
        this.riskId = riskId;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public RiskCategory getCategory() {
        return category;
    }

    public void setCategory(RiskCategory category) {
        this.category = category;
    }

    public Likelihood getLikelihood() {
        return likelihood;
    }

    public void setLikelihood(Likelihood likelihood) {
        this.likelihood = likelihood;
    }

    public Impact getImpact() {
        return impact;
    }

    public void setImpact(Impact impact) {
        this.impact = impact;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public RiskLevel getLevel() {
        return level;
    }

    public void setLevel(RiskLevel level) {
        this.level = level;
    }

    public String getControlOwner() {
        return controlOwner;
    }

    public void setControlOwner(String controlOwner) {
        this.controlOwner = controlOwner;
    }

    public String getExistingControls() {
        return existingControls;
    }

    public void setExistingControls(String existingControls) {
        this.existingControls = existingControls;
    }

    public String getMitigationPlan() {
        return mitigationPlan;
    }

    public void setMitigationPlan(String mitigationPlan) {
        this.mitigationPlan = mitigationPlan;
    }

    public LocalDate getTargetClosureDate() {
        return targetClosureDate;
    }

    public void setTargetClosureDate(LocalDate targetClosureDate) {
        this.targetClosureDate = targetClosureDate;
    }

    public String getMitigationUpdate() {
        return mitigationUpdate;
    }

    public void setMitigationUpdate(String mitigationUpdate) {
        this.mitigationUpdate = mitigationUpdate;
    }

    public LocalDate getActualClosureDate() {
        return actualClosureDate;
    }

    public void setActualClosureDate(LocalDate actualClosureDate) {
        this.actualClosureDate = actualClosureDate;
    }

    public RiskStatus getStatus() {
        return status;
    }

    public void setStatus(RiskStatus status) {
        this.status = status;
    }

    public Long getIdentifiedById() {
        return identifiedById;
    }

    public void setIdentifiedById(Long identifiedById) {
        this.identifiedById = identifiedById;
    }

    public String getIdentifiedByName() {
        return identifiedByName;
    }

    public void setIdentifiedByName(String identifiedByName) {
        this.identifiedByName = identifiedByName;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
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


    // =========================================================
    // TO STRING
    // =========================================================

    @Override
    public String toString() {
        return "RiskResponseDTO{" +
                "id=" + id +
                ", riskId='" + riskId + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", department=" + department +
                ", businessUnit='" + businessUnit + '\'' +
                ", processName='" + processName + '\'' +
                ", remarks='" + remarks + '\'' +
                ", category=" + category +
                ", likelihood=" + likelihood +
                ", impact=" + impact +
                ", riskScore=" + riskScore +
                ", level=" + level +
                ", controlOwner='" + controlOwner + '\'' +
                ", existingControls='" + existingControls + '\'' +
                ", mitigationPlan='" + mitigationPlan + '\'' +
                ", targetClosureDate=" + targetClosureDate +
                ", mitigationUpdate='" + mitigationUpdate + '\'' +
                ", actualClosureDate=" + actualClosureDate +
                ", status=" + status +
                ", identifiedById=" + identifiedById +
                ", identifiedByName='" + identifiedByName + '\'' +
                ", assignedToId=" + assignedToId +
                ", assignedToName='" + assignedToName + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
