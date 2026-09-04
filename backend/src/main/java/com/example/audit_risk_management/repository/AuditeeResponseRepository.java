package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.AuditeeResponseStatus;
import com.example.audit_risk_management.model.AuditeeResponse;

@Repository
public interface AuditeeResponseRepository
        extends JpaRepository<AuditeeResponse, Long> {

    // ============================================================
    // GET RESPONSES BY FINDING
    // ============================================================

    List<AuditeeResponse> findByFindingId(Long findingId);


    // ============================================================
    // GET RESPONSES BY AUDITEE
    // ============================================================

    List<AuditeeResponse> findByAuditeeId(Long auditeeId);


    // ============================================================
    // GET RESPONSES BY STATUS
    // ============================================================

    List<AuditeeResponse> findByStatus(
            AuditeeResponseStatus status
    );


    // ============================================================
    // GET RESPONSES BY FINDING + STATUS
    // ============================================================

    List<AuditeeResponse> findByFindingIdAndStatus(
            Long findingId,
            AuditeeResponseStatus status
    );


    // ============================================================
    // GET RESPONSES BY AUDITEE + STATUS
    // ============================================================

    List<AuditeeResponse> findByAuditeeIdAndStatus(
            Long auditeeId,
            AuditeeResponseStatus status
    );


    // ============================================================
    // CHECK RESPONSE EXISTS FOR FINDING + AUDITEE
    // ============================================================

    boolean existsByFindingIdAndAuditeeId(
            Long findingId,
            Long auditeeId
    );


    // ============================================================
    // FIND RESPONSE BY FINDING + AUDITEE
    // ============================================================

    List<AuditeeResponse> findByFindingIdAndAuditeeId(
            Long findingId,
            Long auditeeId
    );


    // ============================================================
    // COUNT BY STATUS
    // ============================================================

    long countByStatus(
            AuditeeResponseStatus status
    );


    // ============================================================
    // COUNT BY AUDITEE
    // ============================================================

    long countByAuditeeId(
            Long auditeeId
    );


    // ============================================================
    // COUNT BY FINDING
    // ============================================================

    long countByFindingId(
            Long findingId
    );
}