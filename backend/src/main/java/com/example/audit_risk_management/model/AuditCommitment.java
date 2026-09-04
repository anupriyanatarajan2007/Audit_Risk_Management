package com.example.audit_risk_management.model;

import java.time.LocalDate;

import com.example.audit_risk_management.enums.CommitmentStatus;

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
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_commitments")
public class AuditCommitment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // INTERNAL AUDITOR
    // =========================================================
    // Nullable because commitment can be created before
    // Internal Auditor assignment.
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id", nullable = true)
    private User auditor;


    // =========================================================
    // AUDITEE
    // =========================================================
    // Auditee is selected when Audit Commitment is created.
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditee_id", nullable = false)
    private User auditee;


    // =========================================================
    // AUDIT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    private Audit audit;


    // =========================================================
    // COMMITMENT DETAILS
    // =========================================================

    @Column(name = "commitment_type", nullable = false)
    private String commitmentType;


    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;


    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommitmentStatus status;


    // =========================================================
    // NO ARGUMENT CONSTRUCTOR
    // =========================================================

    public AuditCommitment() {
    }


    // =========================================================
    // OLD CONSTRUCTOR
    // =========================================================
    // Kept so existing code does not immediately break.
    // =========================================================

    public AuditCommitment(
            User auditor,
            Audit audit,
            String commitmentType,
            LocalDate startDate,
            LocalDate dueDate,
            CommitmentStatus status) {

        this.auditor = auditor;
        this.audit = audit;
        this.commitmentType = commitmentType;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.status = status;
    }


    // =========================================================
    // NEW CONSTRUCTOR
    // =========================================================

    public AuditCommitment(
            User auditee,
            Audit audit,
            String commitmentType,
            LocalDate startDate,
            LocalDate dueDate,
            CommitmentStatus status,
            User auditor) {

        this.auditee = auditee;
        this.audit = audit;
        this.commitmentType = commitmentType;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.status = status;
        this.auditor = auditor;
    }


    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // =========================================================
    // AUDITOR
    // =========================================================

    public User getAuditor() {
        return auditor;
    }

    public void setAuditor(User auditor) {
        this.auditor = auditor;
    }


    // =========================================================
    // AUDITEE
    // =========================================================

    public User getAuditee() {
        return auditee;
    }

    public void setAuditee(User auditee) {
        this.auditee = auditee;
    }


    // =========================================================
    // AUDIT
    // =========================================================

    public Audit getAudit() {
        return audit;
    }

    public void setAudit(Audit audit) {
        this.audit = audit;
    }


    // =========================================================
    // COMMITMENT TYPE
    // =========================================================

    public String getCommitmentType() {
        return commitmentType;
    }

    public void setCommitmentType(String commitmentType) {
        this.commitmentType = commitmentType;
    }


    // =========================================================
    // START DATE
    // =========================================================

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }


    // =========================================================
    // DUE DATE
    // =========================================================

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }


    // =========================================================
    // STATUS
    // =========================================================

    public CommitmentStatus getStatus() {
        return status;
    }

    public void setStatus(CommitmentStatus status) {
        this.status = status;
    }
}
