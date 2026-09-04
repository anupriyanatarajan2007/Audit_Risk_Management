package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.AuditRequestDTO;
import com.example.audit_risk_management.dto.AuditResponseDTO;

public interface AuditService {

    AuditResponseDTO createAudit(AuditRequestDTO dto);

    List<AuditResponseDTO> getAllAudits();

    AuditResponseDTO getAuditById(Long id);

    AuditResponseDTO updateAudit(
            Long id,
            AuditRequestDTO dto
    );

    void deleteAudit(Long id);

    AuditResponseDTO assignInternalAuditor(
            Long auditId,
            Long auditorId
    );

    AuditResponseDTO updateAuditStatus(
            Long auditId,
            String status
    );

    List<AuditResponseDTO>
    getAuditsForCurrentInternalAuditor();

    List<AuditResponseDTO> getAuditsForCurrentAuditee();
}