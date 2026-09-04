package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.AuditeeResponseStatus;

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
@Table(name = "auditee_responses")
public class AuditeeResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // FINDING
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id", nullable = false)
    private Finding finding;

    // ============================================================
    // AUDITEE
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditee_id", nullable = false)
    private User auditee;

    // ============================================================
    // RESPONSE
    // ============================================================

    @Column(nullable = false, length = 5000)
    private String responseText;

    // ============================================================
    // ROOT CAUSE
    // ============================================================

    @Column(length = 3000)
    private String rootCause;

    // ============================================================
    // CORRECTIVE ACTION
    // ============================================================

    @Column(length = 3000)
    private String correctiveAction;

    // ============================================================
    // TARGET COMPLETION DATE
    // ============================================================

    private LocalDate targetCompletionDate;

    // ============================================================
    // STATUS
    // ============================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditeeResponseStatus status;

    // ============================================================
    // REVIEW COMMENTS
    // ============================================================

    @Column(length = 3000)
    private String reviewComments;

    // ============================================================
    // DATES
    // ============================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public AuditeeResponse() {
    }

    // ============================================================
    // PRE PERSIST
    // ============================================================

    @PrePersist
    public void prePersist() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = AuditeeResponseStatus.DRAFT;
        }
    }

    // ============================================================
    // PRE UPDATE
    // ============================================================

    @PreUpdate
    public void preUpdate() {

        updatedAt = LocalDateTime.now();
    }

    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Finding getFinding() {
        return finding;
    }

    public void setFinding(Finding finding) {
        this.finding = finding;
    }

    public User getAuditee() {
        return auditee;
    }

    public void setAuditee(User auditee) {
        this.auditee = auditee;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getCorrectiveAction() {
        return correctiveAction;
    }

    public void setCorrectiveAction(String correctiveAction) {
        this.correctiveAction = correctiveAction;
    }

    public LocalDate getTargetCompletionDate() {
        return targetCompletionDate;
    }

    public void setTargetCompletionDate(LocalDate targetCompletionDate) {
        this.targetCompletionDate = targetCompletionDate;
    }

    public AuditeeResponseStatus getStatus() {
        return status;
    }

    public void setStatus(AuditeeResponseStatus status) {
        this.status = status;
    }

    public String getReviewComments() {
        return reviewComments;
    }

    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
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

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}