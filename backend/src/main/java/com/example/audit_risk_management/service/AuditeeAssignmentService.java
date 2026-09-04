package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.AuditeeAssignmentRequestDTO;
import com.example.audit_risk_management.dto.AuditeeAssignmentResponseDTO;

public interface AuditeeAssignmentService {

    // ============================================================
    // ASSIGN AUDITEE
    // ============================================================

    AuditeeAssignmentResponseDTO assignAuditee(
            AuditeeAssignmentRequestDTO requestDTO
    );


    // ============================================================
    // GET ALL ASSIGNMENTS
    // ============================================================

    List<AuditeeAssignmentResponseDTO> getAllAssignments();


    // ============================================================
    // GET ASSIGNMENT BY ID
    // ============================================================

    AuditeeAssignmentResponseDTO getAssignmentById(
            Long id
    );


    // ============================================================
    // GET ASSIGNMENTS BY AUDIT
    // ============================================================

    List<AuditeeAssignmentResponseDTO> getAssignmentsByAudit(
            Long auditId
    );


    // ============================================================
    // GET ASSIGNMENTS BY AUDITEE
    // ============================================================

    List<AuditeeAssignmentResponseDTO> getAssignmentsByAuditee(
            Long auditeeId
    );


    // ============================================================
    // GET ASSIGNMENTS BY ASSIGNED BY
    // ============================================================

    List<AuditeeAssignmentResponseDTO> getAssignmentsByAssignedBy(
            Long assignedById
    );


    // ============================================================
    // UPDATE STATUS
    // ============================================================

    AuditeeAssignmentResponseDTO updateStatus(
            Long id,
            String status
    );


    // ============================================================
    // DELETE
    // ============================================================

    void deleteAssignment(
            Long id
    );
}