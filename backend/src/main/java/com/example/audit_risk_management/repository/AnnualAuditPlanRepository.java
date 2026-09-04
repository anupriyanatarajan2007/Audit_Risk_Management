package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;
import com.example.audit_risk_management.model.AnnualAuditPlan;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.User;

@Repository
public interface AnnualAuditPlanRepository
        extends JpaRepository<AnnualAuditPlan, Long> {

    Optional<AnnualAuditPlan> findByPlanId(String planId);

    boolean existsByPlanYearAndDepartment(
            Integer planYear,
            Department department);

    List<AnnualAuditPlan> findByAuditManager(User auditManager);

    List<AnnualAuditPlan> findByPlanYear(Integer planYear);

    List<AnnualAuditPlan> findByStatus(
            AnnualAuditPlanStatus status);
}