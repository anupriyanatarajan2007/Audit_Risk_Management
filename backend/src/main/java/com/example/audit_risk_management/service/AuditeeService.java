package com.example.audit_risk_management.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.audit_risk_management.dto.AuditResponseDTO;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Evidence;

public interface AuditeeService {

    // ============================================================
    // AUDITEE - ASSIGNED AUDITS
    // ============================================================

    /**
     * Get all audits assigned to an Auditee.
     */
    List<Audit> getAssignedAudits(Long userId);


    // ============================================================
    // AUDITEE - EVIDENCE
    // ============================================================

    /**
     * Upload evidence for an assigned audit.
     */
    Evidence uploadEvidence(
            Long userId,
            String auditId,
            MultipartFile file,
            String description
    );


    /**
     * Get all evidence uploaded by an Auditee.
     */
    List<Evidence> getEvidenceByUser(Long userId);


    /**
     * Get all evidence submitted for a particular audit.
     */
    List<Evidence> getEvidenceByAudit(String auditId);


    /**
     * Get a particular evidence record.
     */
    Evidence getEvidenceById(Long evidenceId);


    /**
     * Delete evidence uploaded by the Auditee.
     */
    void deleteEvidence(
            Long evidenceId,
            Long userId
    );


  
}