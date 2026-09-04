package com.example.audit_risk_management.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "evidence")
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    private String fileUrl;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    private EvidenceStatus status;

    private LocalDateTime uploadedAt;


    // =========================================================
    // Evidence belongs to Audit
    // One Audit -> Many Evidence
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    @JsonIgnoreProperties({
        "hibernateInitializer",
        "handler",
        "hibernateLazyInitializer",
        "risk",
        "internalAuditor",
        "evidence",
        "findings"
    })
    private Audit audit;


    // =========================================================
    // Evidence belongs to Finding
    // One Finding -> Many Evidence
    //
    // nullable = true because evidence can belong to
    // the overall audit without a specific finding.
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id")
    @JsonIgnoreProperties({
        "hibernateInitializer",
        "handler",
        "hibernateLazyInitializer",
        "audit",
        "evidence"
    })
    private Finding finding;


    // =========================================================
    // Evidence uploaded by User / Auditee
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    @JsonIgnoreProperties({
        "hibernateInitializer",
        "handler",
        "hibernateLazyInitializer",
        "password",
        "evidence"
    })
    private User uploadedBy;


    // =========================================================
    // Constructor
    // =========================================================

    public Evidence() {
        this.status = EvidenceStatus.PENDING;
    }


    // =========================================================
    // Pre Persist
    // =========================================================

    @PrePersist
    public void prePersist() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }

        if (this.status == null) {
            this.status = EvidenceStatus.PENDING;
        }
    }


    // =========================================================
    // Getter and Setter - id
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // =========================================================
    // Getter and Setter - fileName
    // =========================================================

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }


    // =========================================================
    // Getter and Setter - fileUrl
    // =========================================================

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }


    // =========================================================
    // Getter and Setter - description
    // =========================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    // =========================================================
    // Getter and Setter - status
    // =========================================================

    public EvidenceStatus getStatus() {
        return status;
    }

    public void setStatus(EvidenceStatus status) {
        this.status = status;
    }


    // =========================================================
    // Getter and Setter - uploadedAt
    // =========================================================

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }


    // =========================================================
    // Getter and Setter - audit
    // =========================================================

    public Audit getAudit() {
        return audit;
    }

    public void setAudit(Audit audit) {
        this.audit = audit;
    }


    // =========================================================
    // Getter and Setter - finding
    // =========================================================

    public Finding getFinding() {
        return finding;
    }

    public void setFinding(Finding finding) {
        this.finding = finding;
    }


    // =========================================================
    // Getter and Setter - uploadedBy
    // =========================================================

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }


    // =========================================================
    // JSON RESPONSE - AUDIT ID
    // =========================================================
    // This exposes the foreign-key value directly in GET response.
    // DB: audit_id
    // JSON: auditId
    // =========================================================

    @JsonProperty("auditId")
    public Long getAuditId() {
        return audit != null ? audit.getId() : null;
    }


    // =========================================================
    // JSON RESPONSE - FINDING ID
    // =========================================================
    // This exposes the foreign-key value directly in GET response.
    // DB: finding_id
    // JSON: findingId
    // =========================================================

    @JsonProperty("findingId")
    public Long getFindingId() {
        return finding != null ? finding.getId() : null;
    }
}