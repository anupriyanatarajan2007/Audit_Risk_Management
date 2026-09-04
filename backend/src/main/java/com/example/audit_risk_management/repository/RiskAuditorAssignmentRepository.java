package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.AssignmentStatus;
import com.example.audit_risk_management.model.RiskAuditorAssignment;
import com.example.audit_risk_management.model.User;

@Repository
public interface RiskAuditorAssignmentRepository
        extends JpaRepository<RiskAuditorAssignment, Long> {

    List<RiskAuditorAssignment> findByRisk_RiskId(String riskId);

    List<RiskAuditorAssignment> findByAuditor_EmployeeId(String employeeId);

    List<RiskAuditorAssignment> findByStatus(AssignmentStatus status);

    List<RiskAuditorAssignment> findByAuditor_EmployeeIdAndStatus(
            String employeeId,
            AssignmentStatus status);

    List<RiskAuditorAssignment> findByAssignedBy_EmployeeId(
            String employeeId);

    boolean existsByRisk_RiskIdAndAuditor_EmployeeId(
            String riskId,
            String employeeId);

            List<RiskAuditorAssignment> findByAuditor(User auditor);

            Optional<RiskAuditorAssignment> findByRisk_RiskIdAndAuditor(
                    String riskId,
                    User auditor
            );
}