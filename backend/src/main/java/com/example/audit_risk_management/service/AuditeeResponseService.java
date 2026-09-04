package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.AuditeeResponseRequestDTO;
import com.example.audit_risk_management.dto.AuditeeResponseResponseDTO;
import com.example.audit_risk_management.enums.AuditeeResponseStatus;

public interface AuditeeResponseService {

    // ============================================================
    // SUBMIT RESPONSE
    // ============================================================

    AuditeeResponseResponseDTO submitResponse(
            AuditeeResponseRequestDTO requestDTO
    );


    // ============================================================
    // GET RESPONSE BY ID
    // ============================================================

    AuditeeResponseResponseDTO getResponseById(
            Long id
    );


    // ============================================================
    // GET RESPONSES BY FINDING
    // ============================================================

    List<AuditeeResponseResponseDTO> getResponsesByFinding(
            Long findingId
    );


    // ============================================================
    // GET RESPONSES BY AUDITEE
    // ============================================================

    List<AuditeeResponseResponseDTO> getResponsesByAuditee(
            Long auditeeId
    );


    // ============================================================
    // GET ALL RESPONSES
    // ============================================================

    List<AuditeeResponseResponseDTO> getAllResponses();


    // ============================================================
    // DELETE RESPONSE
    // ============================================================

    void deleteResponse(
            Long id
    );


     AuditeeResponseResponseDTO updateResponseStatus(
            Long id,
            AuditeeResponseStatus status
    );
}