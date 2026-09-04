package com.example.audit_risk_management.model;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.ReviewStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "reviews")
public class Review {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// ============================================================
// REVIEW ID
// ============================================================

@Column(unique = true, nullable = false)
private String reviewId;

// ============================================================
// RISK
// ============================================================

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "risk_id", nullable = false)
private Risk risk;

// ============================================================
// AUDIT
// ============================================================

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "audit_id", nullable = false)
private Audit audit;

// ============================================================
// REVIEWED BY
// Compliance Officer / Audit Manager / CAE / Admin
// ============================================================

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "reviewed_by", nullable = false)
private User reviewedBy;

// ============================================================
// REVIEW COMMENTS
// ============================================================

@Column(length = 5000)
private String comments;

// ============================================================
// STATUS
// ============================================================

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private ReviewStatus status = ReviewStatus.PENDING;

// ============================================================
// DATES
// ============================================================

@Column(nullable = false, updatable = false)
private LocalDateTime createdAt;

@Column(nullable = false)
private LocalDateTime updatedAt;

private LocalDateTime reviewedAt;

// ============================================================
// CONSTRUCTOR
// ============================================================

public Review() {
}

// ============================================================
// PRE PERSIST
// ============================================================

@PrePersist
public void onCreate() {

    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();

    if (status == null) {
        status = ReviewStatus.PENDING;
    }

    if (reviewId == null || reviewId.isBlank()) {
        reviewId = "REV-" + System.currentTimeMillis();
    }
}

// ============================================================
// PRE UPDATE
// ============================================================

@PreUpdate
public void onUpdate() {
    updatedAt = LocalDateTime.now();
}

// ============================================================
// GETTERS
// ============================================================

public Long getId() {
    return id;
}

public String getReviewId() {
    return reviewId;
}

public Risk getRisk() {
    return risk;
}

public Audit getAudit() {
    return audit;
}

public User getReviewedBy() {
    return reviewedBy;
}

public String getComments() {
    return comments;
}

public ReviewStatus getStatus() {
    return status;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public LocalDateTime getUpdatedAt() {
    return updatedAt;
}

public LocalDateTime getReviewedAt() {
    return reviewedAt;
}

// ============================================================
// SETTERS
// ============================================================

public void setId(Long id) {
    this.id = id;
}

public void setReviewId(String reviewId) {
    this.reviewId = reviewId;
}

public void setRisk(Risk risk) {
    this.risk = risk;
}

public void setAudit(Audit audit) {
    this.audit = audit;
}

public void setReviewedBy(User reviewedBy) {
    this.reviewedBy = reviewedBy;
}

public void setComments(String comments) {
    this.comments = comments;
}

public void setStatus(ReviewStatus status) {
    this.status = status;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
}

public void setReviewedAt(LocalDateTime reviewedAt) {
    this.reviewedAt = reviewedAt;
}


}