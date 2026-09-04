package com.example.audit_risk_management.dto;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.RecommendationStatus;

public class RecommendationResponseDTO {

    private Long id;

    private String recommendationId;

    private String recommendationText;

    // Audit
    private Long auditId;
    private String auditCode;
    private String auditName;

    // Finding
    private Long findingId;
    private String findingTitle;

    // Internal Auditor
    private Long internalAuditorId;
    private String internalAuditorName;

    // Auditee
    private Long auditeeId;
    private String auditeeName;
    private String auditeeEmail;

    // Status
    private RecommendationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(String recommendationId) {
        this.recommendationId = recommendationId;
    }


    public String getRecommendationText() {
        return recommendationText;
    }

    public void setRecommendationText(String recommendationText) {
        this.recommendationText = recommendationText;
    }


    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }


    public String getAuditCode() {
        return auditCode;
    }

    public void setAuditCode(String auditCode) {
        this.auditCode = auditCode;
    }


    public String getAuditName() {
        return auditName;
    }

    public void setAuditName(String auditName) {
        this.auditName = auditName;
    }


    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }


    public String getFindingTitle() {
        return findingTitle;
    }

    public void setFindingTitle(String findingTitle) {
        this.findingTitle = findingTitle;
    }


    public Long getInternalAuditorId() {
        return internalAuditorId;
    }

    public void setInternalAuditorId(Long internalAuditorId) {
        this.internalAuditorId = internalAuditorId;
    }


    public String getInternalAuditorName() {
        return internalAuditorName;
    }

    public void setInternalAuditorName(String internalAuditorName) {
        this.internalAuditorName = internalAuditorName;
    }


    public Long getAuditeeId() {
        return auditeeId;
    }

    public void setAuditeeId(Long auditeeId) {
        this.auditeeId = auditeeId;
    }


    public String getAuditeeName() {
        return auditeeName;
    }

    public void setAuditeeName(String auditeeName) {
        this.auditeeName = auditeeName;
    }


    public String getAuditeeEmail() {
        return auditeeEmail;
    }

    public void setAuditeeEmail(String auditeeEmail) {
        this.auditeeEmail = auditeeEmail;
    }


    public RecommendationStatus getStatus() {
        return status;
    }

    public void setStatus(RecommendationStatus status) {
        this.status = status;
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