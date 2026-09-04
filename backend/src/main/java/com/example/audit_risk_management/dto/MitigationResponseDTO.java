package com.example.audit_risk_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.Effectiveness;
import com.example.audit_risk_management.enums.MitigationStatus;
import com.example.audit_risk_management.enums.MitigationType;

public class MitigationResponseDTO {

    private String mitigationId;

    private String mitigationTitle;

    private String mitigationDescription;

    private String riskId;

    private String riskTitle;

    private MitigationType mitigationType;

    private Long ownerId;

    private String ownerName;

    private LocalDate targetDate;

    private LocalDate completedDate;

    private MitigationStatus status;

    private Effectiveness effectiveness;

    private BigDecimal cost;

    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public MitigationResponseDTO() {
    }

    public String getMitigationId() {
        return mitigationId;
    }

    public void setMitigationId(String mitigationId) {
        this.mitigationId = mitigationId;
    }

    public String getMitigationTitle() {
        return mitigationTitle;
    }

    public void setMitigationTitle(String mitigationTitle) {
        this.mitigationTitle = mitigationTitle;
    }

    public String getMitigationDescription() {
        return mitigationDescription;
    }

    public void setMitigationDescription(String mitigationDescription) {
        this.mitigationDescription = mitigationDescription;
    }

    public String getRiskId() {
        return riskId;
    }

    public void setRiskId(String riskId) {
        this.riskId = riskId;
    }

    public String getRiskTitle() {
        return riskTitle;
    }

    public void setRiskTitle(String riskTitle) {
        this.riskTitle = riskTitle;
    }

    public MitigationType getMitigationType() {
        return mitigationType;
    }

    public void setMitigationType(MitigationType mitigationType) {
        this.mitigationType = mitigationType;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public MitigationStatus getStatus() {
        return status;
    }

    public void setStatus(MitigationStatus status) {
        this.status = status;
    }

    public Effectiveness getEffectiveness() {
        return effectiveness;
    }

    public void setEffectiveness(Effectiveness effectiveness) {
        this.effectiveness = effectiveness;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
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