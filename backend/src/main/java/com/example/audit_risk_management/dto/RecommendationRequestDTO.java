package com.example.audit_risk_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecommendationRequestDTO {

    @NotNull(message = "Audit ID is required")
    private Long auditId;

    @NotNull(message = "Finding ID is required")
    private Long findingId;

    @NotBlank(message = "Recommendation is required")
    @Size(
        min = 10,
        max = 2000,
        message = "Recommendation must be between 10 and 2000 characters"
    )
    private String recommendationText;


    // ============================================================
    // GETTER / SETTER - AUDIT ID
    // ============================================================

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }


    // ============================================================
    // GETTER / SETTER - FINDING ID
    // ============================================================

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }


    // ============================================================
    // GETTER / SETTER - RECOMMENDATION TEXT
    // ============================================================

    public String getRecommendationText() {
        return recommendationText;
    }

    public void setRecommendationText(String recommendationText) {
        this.recommendationText = recommendationText;
    }
}