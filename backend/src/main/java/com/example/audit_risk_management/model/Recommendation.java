package com.example.audit_risk_management.model;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.RecommendationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "recommendations")
public class Recommendation {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // RECOMMENDATION ID
    // ============================================================

    @Column(unique = true, nullable = false)
    private String recommendationId;


    // ============================================================
    // RECOMMENDATION TEXT
    // ============================================================

    @Column(nullable = false, length = 2000)
    private String recommendationText;


    // ============================================================
    // AUDIT
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    private Audit audit;


    // ============================================================
    // FINDING
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id", nullable = false)
    private Finding finding;


    // ============================================================
    // INTERNAL AUDITOR
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id", nullable = false)
    private User internalAuditor;


    // ============================================================
    // AUDITEE
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditee_id", nullable = false)
    private User auditee;


    // ============================================================
    // STATUS
    // ============================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status =
            RecommendationStatus.PENDING;


    // ============================================================
    // DATES
    // ============================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // ============================================================
    // GETTER / SETTER - ID
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // ============================================================
    // GETTER / SETTER - RECOMMENDATION ID
    // ============================================================

    public String getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(String recommendationId) {
        this.recommendationId = recommendationId;
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


    // ============================================================
    // GETTER / SETTER - AUDIT
    // ============================================================

    public Audit getAudit() {
        return audit;
    }

    public void setAudit(Audit audit) {
        this.audit = audit;
    }


    // ============================================================
    // GETTER / SETTER - FINDING
    // ============================================================

    public Finding getFinding() {
        return finding;
    }

    public void setFinding(Finding finding) {
        this.finding = finding;
    }


    // ============================================================
    // GETTER / SETTER - INTERNAL AUDITOR
    // ============================================================

    public User getInternalAuditor() {
        return internalAuditor;
    }

    public void setInternalAuditor(User internalAuditor) {
        this.internalAuditor = internalAuditor;
    }


    // ============================================================
    // GETTER / SETTER - AUDITEE
    // ============================================================

    public User getAuditee() {
        return auditee;
    }

    public void setAuditee(User auditee) {
        this.auditee = auditee;
    }


    // ============================================================
    // GETTER / SETTER - STATUS
    // ============================================================

    public RecommendationStatus getStatus() {
        return status;
    }

    public void setStatus(RecommendationStatus status) {
        this.status = status;
    }


    // ============================================================
    // GETTER / SETTER - CREATED AT
    // ============================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    // ============================================================
    // GETTER / SETTER - UPDATED AT
    // ============================================================

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


    // ============================================================
    // JPA - CREATE
    // ============================================================

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = RecommendationStatus.PENDING;
        }

        if (recommendationId == null ||
                recommendationId.isBlank()) {

            recommendationId =
                    "REC-" + System.currentTimeMillis();
        }
    }


    // ============================================================
    // JPA - UPDATE
    // ============================================================

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}