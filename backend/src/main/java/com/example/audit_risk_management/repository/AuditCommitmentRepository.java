package com.example.audit_risk_management.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.CommitmentStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.AuditCommitment;
import com.example.audit_risk_management.model.User;

@Repository
public interface AuditCommitmentRepository
        extends JpaRepository<AuditCommitment, Long> {

    // ============================================================
    // AUDITOR
    // ============================================================

    List<AuditCommitment> findByAuditor(User auditor);

    List<AuditCommitment> findByAuditorAndStatus(
            User auditor,
            CommitmentStatus status
    );

    List<AuditCommitment> findByAuditorAndStatusIn(
            User auditor,
            List<CommitmentStatus> statuses
    );


    // ============================================================
    // AUDITEE
    // ============================================================

    List<AuditCommitment> findByAuditee(User auditee);

    List<AuditCommitment> findByAuditeeAndStatus(
            User auditee,
            CommitmentStatus status
    );

    List<AuditCommitment> findByAuditeeAndStatusIn(
            User auditee,
            List<CommitmentStatus> statuses
    );


    // ============================================================
    // AUDIT
    // ============================================================

    List<AuditCommitment> findByAudit(Audit audit);


    // ============================================================
    // STATUS
    // ============================================================

    List<AuditCommitment> findByStatus(
            CommitmentStatus status
    );


    // ============================================================
    // DATE
    // ============================================================

    List<AuditCommitment> findByStartDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<AuditCommitment> findByDueDateBefore(
            LocalDate date
    );


    // ============================================================
    // WORKLOAD
    // ============================================================

    long countByAuditee(User auditee);

    long countByAuditeeAndStatus(
            User auditee,
            CommitmentStatus status
    );

    long countByAuditeeAndStatusIn(
            User auditee,
            List<CommitmentStatus> statuses
    );
}