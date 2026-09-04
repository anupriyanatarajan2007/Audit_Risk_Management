package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.EvidenceStatus;
import com.example.audit_risk_management.model.Evidence;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    // ============================================================
    // AUDIT
    // ============================================================

    List<Evidence> findByAudit_Id(Long auditId);

    List<Evidence> findByAudit_IdAndStatus(
            Long auditId,
            EvidenceStatus status
    );

    // ============================================================
    // FINDING
    // ============================================================

    List<Evidence> findByFinding_Id(Long findingId);

    List<Evidence> findByFinding_IdAndStatus(
            Long findingId,
            EvidenceStatus status
    );

    List<Evidence> findByAudit_IdAndFinding_Id(
            Long auditId,
            Long findingId
    );

    // ============================================================
    // USER
    // ============================================================

    List<Evidence> findByUploadedBy_Id(Long userId);

    // ============================================================
    // STATUS
    // ============================================================

    List<Evidence> findByStatus(EvidenceStatus status);

    // ============================================================
    // FILE SEARCH
    // ============================================================

    List<Evidence> findByFileNameContainingIgnoreCase(
            String fileName
    );

    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    boolean existsByAudit_IdAndFileName(
            Long auditId,
            String fileName
    );

    boolean existsByFinding_IdAndFileName(
            Long findingId,
            String fileName
    );

    // ============================================================
    // COUNT
    // ============================================================

    long countByAudit_Id(Long auditId);

    long countByFinding_Id(Long findingId);

    long countByAudit_IdAndStatus(
            Long auditId,
            EvidenceStatus status
    );

    long countByFinding_IdAndStatus(
            Long findingId,
            EvidenceStatus status
    );
}