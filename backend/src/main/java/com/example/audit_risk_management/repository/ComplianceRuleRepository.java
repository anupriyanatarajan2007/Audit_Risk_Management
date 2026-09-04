package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.audit_risk_management.model.ComplianceRule;

public interface ComplianceRuleRepository
        extends JpaRepository<ComplianceRule, Long> {

    List<ComplianceRule> findByRegulatoryRequirementId(Long regulatoryRequirementId);

    List<ComplianceRule> findByApplicableDepartment(
            String applicableDepartment);

    List<ComplianceRule> findByStatus(
            com.example.audit_risk_management.enums.ComplianceRuleStatus status);

    boolean existsByRuleCode(String ruleCode);
}