package com.example.audit_risk_management.dto;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.FindingStatus;
import com.example.audit_risk_management.enums.RiskLevel;

public class FindingResponseDTO {

    private Long id;

    // Audit information
    private Long auditDbId;
    private String auditId;
    private String auditName;

    // Finding information
    private String title;
    private String observation;
    private RiskLevel riskLevel;
    private String recommendation;
    private FindingStatus status;

    // Auditor information
    private String auditorName;

    // Dates
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FindingResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuditId() {
        return auditId;
    }

    public void setAuditId(String auditId) {
        this.auditId = auditId;
    }

    public String getAuditName() {
        return auditName;
    }

    public void setAuditName(String auditName) {
        this.auditName = auditName;
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

    public String getAuditorName() {
        return auditorName;
    }

    public void setAuditorName(String auditorName) {
        this.auditorName = auditorName;
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

    public Long getAuditDbId() {
        return auditDbId;
    }

    public void setAuditDbId(Long auditDbId) {
        this.auditDbId = auditDbId;
    }
}