package com.example.audit_risk_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.audit_risk_management.enums.Effectiveness;
import com.example.audit_risk_management.enums.MitigationStatus;
import com.example.audit_risk_management.enums.MitigationType;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MitigationRequestDTO {

    @NotBlank(message = "Mitigation title is required")
    @Size(max = 150)
    private String mitigationTitle;

    @NotBlank(message = "Mitigation description is required")
    @Size(max = 1000)
    private String mitigationDescription;

    @NotNull(message = "Risk ID is required")
    private Long riskId;

    @NotNull(message = "Mitigation type is required")
    private MitigationType mitigationType;

    @FutureOrPresent(message = "Target date cannot be in the past")
    private LocalDate targetDate;

    private LocalDate completedDate;

    private MitigationStatus status;

    private Effectiveness effectiveness;

    private BigDecimal cost;

    @Size(max = 500)
    private String remarks;

    public MitigationRequestDTO() {
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

    public Long getRiskId() {
        return riskId;
    }

    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }

    public MitigationType getMitigationType() {
        return mitigationType;
    }

    public void setMitigationType(MitigationType mitigationType) {
        this.mitigationType = mitigationType;
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
}