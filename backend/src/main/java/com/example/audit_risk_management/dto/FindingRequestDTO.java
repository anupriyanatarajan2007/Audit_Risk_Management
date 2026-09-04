package com.example.audit_risk_management.dto;

import com.example.audit_risk_management.enums.FindingStatus;
import com.example.audit_risk_management.enums.RiskLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FindingRequestDTO {

    // =========================================================
    // AUDIT ID
    // =========================================================

    @NotBlank(message = "Audit Id is required")
    private String auditId;

    // =========================================================
    // FINDING TITLE
    // =========================================================

    @NotBlank(message = "Title is required")
    private String title;

    // =========================================================
    // OBSERVATION
    // =========================================================

    @NotBlank(message = "Observation is required")
    private String observation;

    // =========================================================
    // RISK LEVEL
    // =========================================================

    @NotNull(message = "Risk Level is required")
    private RiskLevel riskLevel;

    // =========================================================
    // RECOMMENDATION
    // =========================================================

    @NotBlank(message = "Recommendation is required")
    private String recommendation;

    // =========================================================
    // STATUS
    // =========================================================

    private FindingStatus status;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public FindingRequestDTO() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getAuditId() {
        return auditId;
    }

    public void setAuditId(String auditId) {
        this.auditId = auditId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public FindingStatus getStatus() {
        return status;
    }

    public void setStatus(FindingStatus status) {
        this.status = status;
    }
}