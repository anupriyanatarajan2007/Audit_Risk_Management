package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.FindingStatus;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Finding;
import com.example.audit_risk_management.model.User;

@Repository
public interface FindingRepository extends JpaRepository<Finding, Long> {

    // ==========================
    // Findings by Audit
    // ==========================

    List<Finding> findByAudit(Audit audit);

    List<Finding> findByAuditId(Long auditId);


    // ==========================
    // Findings by Auditor
    // ==========================

    List<Finding> findByAuditor(User auditor);

    List<Finding> findByAuditorId(Long auditorId);


    // ==========================
    // Findings by Status
    // ==========================

    List<Finding> findByStatus(FindingStatus status);


    // ==========================
    // Findings by Risk Level
    // ==========================

    List<Finding> findByRiskLevel(RiskLevel riskLevel);


    // ==========================
    // Auditor + Status
    // ==========================

    List<Finding> findByAuditorAndStatus(
            User auditor,
            FindingStatus status
    );


    // ==========================
    // Audit + Status
    // ==========================

    List<Finding> findByAuditAndStatus(
            Audit audit,
            FindingStatus status
    );


    // ==========================
    // Audit + Risk Level
    // ==========================

    List<Finding> findByAuditAndRiskLevel(
            Audit audit,
            RiskLevel riskLevel
    );


    // ==========================
    // Auditor + Risk Level
    // ==========================

    List<Finding> findByAuditorAndRiskLevel(
            User auditor,
            RiskLevel riskLevel
    );


    // ==========================
    // Count Findings
    // ==========================

    long countByAudit(Audit audit);

    long countByAuditor(User auditor);

    long countByStatus(FindingStatus status);

    long countByRiskLevel(RiskLevel riskLevel);


    // ==========================
    // Check Finding Ownership
    // ==========================

    boolean existsByIdAndAuditor(
            Long id,
            User auditor
    );
}