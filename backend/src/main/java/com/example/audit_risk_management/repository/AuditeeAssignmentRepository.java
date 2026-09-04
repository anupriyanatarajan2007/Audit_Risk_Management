package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.AuditeeAssignment;
import com.example.audit_risk_management.model.User;

@Repository
public interface AuditeeAssignmentRepository
        extends JpaRepository<AuditeeAssignment, Long> {

    // AuditeeServiceImpl
    List<AuditeeAssignment> findByAuditee(User auditee);

    // AuditeeServiceImpl
    boolean existsByAuditAndAuditee(
            Audit audit,
            User auditee
    );

    // AuditeeAssignmentServiceImpl
    boolean existsByAuditIdAndAuditeeId(
            Long auditId,
            Long auditeeId
    );

    // AuditeeAssignmentServiceImpl
    List<AuditeeAssignment> findByAuditId(
            Long auditId
    );

    // AuditeeAssignmentServiceImpl
    List<AuditeeAssignment> findByAuditeeId(
            Long auditeeId
    );

    // AuditeeAssignmentServiceImpl
    List<AuditeeAssignment> findByAssignedById(
            Long assignedById
    );
}