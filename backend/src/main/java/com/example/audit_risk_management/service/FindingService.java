package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.FindingRequestDTO;
import com.example.audit_risk_management.dto.FindingResponseDTO;
import com.example.audit_risk_management.enums.FindingStatus;
import com.example.audit_risk_management.enums.RiskLevel;

public interface FindingService {

    // ==========================
    // Create Finding
    // ==========================

    FindingResponseDTO createFinding(
            FindingRequestDTO requestDTO
    );


    // ==========================
    // Update Finding
    // ==========================

    FindingResponseDTO updateFinding(
            Long id,
            FindingRequestDTO requestDTO
    );


    // ==========================
    // Get Finding By ID
    // ==========================

    FindingResponseDTO getFindingById(
            Long id
    );


    // ==========================
    // Get All Findings
    // ==========================

    List<FindingResponseDTO> getAllFindings();


    // ==========================
    // Get Findings By Audit
    // ==========================

    List<FindingResponseDTO> getFindingsByAuditId(
            Long auditId
    );


    // ==========================
    // Get Findings By Auditor
    // ==========================

    List<FindingResponseDTO> getFindingsByAuditorId(
            Long auditorId
    );


    // ==========================
    // Get Findings By Status
    // ==========================

    List<FindingResponseDTO> getFindingsByStatus(
            FindingStatus status
    );


    // ==========================
    // Get Findings By Risk Level
    // ==========================

    List<FindingResponseDTO> getFindingsByRiskLevel(
            RiskLevel riskLevel
    );


    // ==========================
    // Get Auditor Findings By Status
    // ==========================

    List<FindingResponseDTO> getFindingsByAuditorAndStatus(
            Long auditorId,
            FindingStatus status
    );


    // ==========================
    // Get Audit Findings By Risk
    // ==========================

    List<FindingResponseDTO> getFindingsByAuditAndRiskLevel(
            Long auditId,
            RiskLevel riskLevel
    );


    // ==========================
    // Delete Finding
    // ==========================

    void deleteFinding(
            Long id
    );
}