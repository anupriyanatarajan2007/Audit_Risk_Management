package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.ComplianceRuleRequest;
import com.example.audit_risk_management.dto.ComplianceRuleResponseDTO;

public interface ComplianceRuleService {

    ComplianceRuleResponseDTO createComplianceRule(
            ComplianceRuleRequest request);

    ComplianceRuleResponseDTO getComplianceRuleById(Long id);

    List<ComplianceRuleResponseDTO> getAllComplianceRules();

    ComplianceRuleResponseDTO updateComplianceRule(
            Long id,
            ComplianceRuleRequest request);

    void deleteComplianceRule(Long id);

    List<ComplianceRuleResponseDTO> getRulesByRegulatoryRequirement(
            Long regulatoryRequirementId);

    List<ComplianceRuleResponseDTO> getRulesByDepartment(
            String department);
}