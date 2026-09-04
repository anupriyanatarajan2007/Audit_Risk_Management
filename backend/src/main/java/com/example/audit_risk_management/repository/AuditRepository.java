package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.AuditStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.User;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {

    // Find by Audit ID (Example: AUD-001)
    Optional<Audit> findByAuditId(String auditId);

    // Check duplicate Audit ID
    boolean existsByAuditId(String auditId);

    // Get audits by status
    List<Audit> findByStatus(AuditStatus status);

    // Get audits assigned to an Internal Auditor
    List<Audit> findByInternalAuditor(User internalAuditor);
 
    // Get audits by department
    List<Audit> findByDepartment(Department department);

    // Get audits assigned to an Auditee
// List<Audit> findByAuditee(User auditee);

}