package com.example.audit_risk_management.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.enums.RiskStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Long> {

    // =========================================================
    // BASIC SEARCH
    // =========================================================

    Optional<Risk> findByRiskId(String riskId);

    boolean existsByRiskId(String riskId);


    // =========================================================
    // USER
    // =========================================================

    // Risks identified by a particular user
    List<Risk> findByIdentifiedBy(User identifiedBy);

    // Risks assigned to a particular user
    List<Risk> findByAssignedTo(User assignedTo);

    // Count risks assigned to a particular user
    long countByAssignedTo(User assignedTo);


    // =========================================================
    // STATUS
    // =========================================================

    List<Risk> findByStatus(RiskStatus status);

    List<Risk> findByDepartmentAndStatus(
            Department department,
            RiskStatus status);

    long countByStatus(RiskStatus status);


    // =========================================================
    // RISK LEVEL
    // =========================================================

    List<Risk> findByLevel(RiskLevel level);

    long countByLevel(RiskLevel level);


    // =========================================================
    // DEPARTMENT
    // =========================================================

    List<Risk> findByDepartment(Department department);


    // =========================================================
    // CATEGORY
    // =========================================================

    List<Risk> findByCategory(RiskCategory category);

    long countByCategory(RiskCategory category);


    // =========================================================
    // BUSINESS / PROCESS
    // =========================================================

    List<Risk> findByBusinessUnit(String businessUnit);

    List<Risk> findByProcessName(String processName);


    // =========================================================
    // SEARCH
    // =========================================================

    List<Risk> findByTitleContainingIgnoreCase(String title);


    // =========================================================
    // OVERDUE RISKS
    // =========================================================

    List<Risk> findByTargetClosureDateBeforeAndStatusNot(
            LocalDate date,
            RiskStatus status);
}
