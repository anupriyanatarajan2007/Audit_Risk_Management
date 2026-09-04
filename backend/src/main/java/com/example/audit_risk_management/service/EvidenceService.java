package com.example.audit_risk_management.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.audit_risk_management.enums.EvidenceStatus;
import com.example.audit_risk_management.model.Evidence;

public interface EvidenceService {

    // ============================================================
    // UPLOAD
    // ============================================================

    // findingId = null  -> Audit-level evidence
    // findingId != null -> Finding-specific evidence
    Evidence uploadEvidence(
            Long auditId,
            Long findingId,
            Long userId,
            MultipartFile file,
            String description
    );

    // Audit-level evidence
    Evidence uploadAuditEvidence(
            Long auditId,
            Long userId,
            MultipartFile file,
            String description
    );

    // Finding-level evidence
    Evidence uploadFindingEvidence(
            Long auditId,
            Long findingId,
            Long userId,
            MultipartFile file,
            String description
    );

    // ============================================================
    // GET
    // ============================================================

    List<Evidence> getAllEvidence();

    Evidence getEvidenceById(Long evidenceId);

    // All evidence belonging to an audit
    List<Evidence> getEvidenceByAudit(Long auditId);

    // All evidence belonging to a finding
    List<Evidence> getEvidenceByFinding(Long findingId);

    // Finding evidence filtered by status
    List<Evidence> getEvidenceByFindingAndStatus(
            Long findingId,
            EvidenceStatus status
    );

    // Evidence for specific audit + finding
    List<Evidence> getEvidenceByAuditAndFinding(
            Long auditId,
            Long findingId
    );

    // Evidence uploaded by user
    List<Evidence> getEvidenceByUser(Long userId);

    // Pending evidence
    List<Evidence> getPendingEvidence();

    // ============================================================
    // STATUS
    // ============================================================

    Evidence approveEvidence(Long evidenceId);

    Evidence rejectEvidence(Long evidenceId);

    // ============================================================
    // DELETE
    // ============================================================

    void deleteEvidence(Long evidenceId);
}