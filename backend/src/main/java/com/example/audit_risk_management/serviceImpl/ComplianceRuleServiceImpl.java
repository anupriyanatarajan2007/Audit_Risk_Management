package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.ComplianceRuleRequest;
import com.example.audit_risk_management.dto.ComplianceRuleResponseDTO;
import com.example.audit_risk_management.enums.ComplianceRuleStatus;
import com.example.audit_risk_management.model.ComplianceRule;
import com.example.audit_risk_management.model.RegulatoryRequirement;
import com.example.audit_risk_management.repository.ComplianceRuleRepository;
import com.example.audit_risk_management.repository.RegulatoryRequirementRepository;
import com.example.audit_risk_management.service.ComplianceRuleService;

@Service
@Transactional
public class ComplianceRuleServiceImpl
        implements ComplianceRuleService {

    private final ComplianceRuleRepository complianceRuleRepository;
    private final RegulatoryRequirementRepository regulatoryRequirementRepository;

    public ComplianceRuleServiceImpl(
            ComplianceRuleRepository complianceRuleRepository,
            RegulatoryRequirementRepository regulatoryRequirementRepository) {

        this.complianceRuleRepository = complianceRuleRepository;
        this.regulatoryRequirementRepository =
                regulatoryRequirementRepository;
    }

    // ============================================================
    // CREATE
    // ============================================================

    @Override
    public ComplianceRuleResponseDTO createComplianceRule(
            ComplianceRuleRequest request) {

        // Check duplicate rule code
        if (complianceRuleRepository.existsByRuleCode(
                request.getRuleCode())) {

            throw new RuntimeException(
                    "Compliance rule code already exists: "
                            + request.getRuleCode());
        }

        // Find Regulatory Requirement
        RegulatoryRequirement regulatoryRequirement =
                regulatoryRequirementRepository
                        .findById(request.getRegulatoryRequirementId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Regulatory requirement not found with ID: "
                                                + request.getRegulatoryRequirementId()));

        ComplianceRule rule = new ComplianceRule();

        rule.setRuleCode(request.getRuleCode());
        rule.setRuleName(request.getRuleName());
        rule.setDescription(request.getDescription());
        rule.setRuleType(request.getRuleType());
        rule.setApplicableDepartment(
                request.getApplicableDepartment());
        rule.setApplicableProcess(
                request.getApplicableProcess());
        rule.setControlRequirement(
                request.getControlRequirement());
        rule.setEvidenceRequired(
                request.getEvidenceRequired());
        rule.setFrequency(
                request.getFrequency());

        rule.setStatus(ComplianceRuleStatus.ACTIVE);

        rule.setRegulatoryRequirement(
                regulatoryRequirement);

        ComplianceRule savedRule =
                complianceRuleRepository.save(rule);

        return convertToResponseDTO(savedRule);
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public ComplianceRuleResponseDTO getComplianceRuleById(
            Long id) {

        ComplianceRule rule =
                complianceRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Compliance rule not found with ID: "
                                                + id));

        return convertToResponseDTO(rule);
    }

    // ============================================================
    // GET ALL
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<ComplianceRuleResponseDTO> getAllComplianceRules() {

        return complianceRuleRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // UPDATE
    // ============================================================

    @Override
    public ComplianceRuleResponseDTO updateComplianceRule(
            Long id,
            ComplianceRuleRequest request) {

        ComplianceRule rule =
                complianceRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Compliance rule not found with ID: "
                                                + id));

        // Check duplicate rule code only if code is changed
        if (!rule.getRuleCode().equals(request.getRuleCode())
                && complianceRuleRepository.existsByRuleCode(
                        request.getRuleCode())) {

            throw new RuntimeException(
                    "Compliance rule code already exists: "
                            + request.getRuleCode());
        }

        // Find Regulatory Requirement
        RegulatoryRequirement regulatoryRequirement =
                regulatoryRequirementRepository
                        .findById(request.getRegulatoryRequirementId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Regulatory requirement not found with ID: "
                                                + request.getRegulatoryRequirementId()));

        rule.setRuleCode(request.getRuleCode());
        rule.setRuleName(request.getRuleName());
        rule.setDescription(request.getDescription());
        rule.setRuleType(request.getRuleType());
        rule.setApplicableDepartment(
                request.getApplicableDepartment());
        rule.setApplicableProcess(
                request.getApplicableProcess());
        rule.setControlRequirement(
                request.getControlRequirement());
        rule.setEvidenceRequired(
                request.getEvidenceRequired());
        rule.setFrequency(
                request.getFrequency());

        rule.setRegulatoryRequirement(
                regulatoryRequirement);

        ComplianceRule updatedRule =
                complianceRuleRepository.save(rule);

        return convertToResponseDTO(updatedRule);
    }

    // ============================================================
    // DELETE
    // ============================================================

    @Override
    public void deleteComplianceRule(Long id) {

        ComplianceRule rule =
                complianceRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Compliance rule not found with ID: "
                                                + id));

        complianceRuleRepository.delete(rule);
    }

    // ============================================================
    // GET BY REGULATORY REQUIREMENT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<ComplianceRuleResponseDTO>
    getRulesByRegulatoryRequirement(
            Long regulatoryRequirementId) {

        // Make sure regulatory requirement exists
        if (!regulatoryRequirementRepository
                .existsById(regulatoryRequirementId)) {

            throw new RuntimeException(
                    "Regulatory requirement not found with ID: "
                            + regulatoryRequirementId);
        }

        return complianceRuleRepository
                .findByRegulatoryRequirementId(
                        regulatoryRequirementId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET BY DEPARTMENT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<ComplianceRuleResponseDTO>
    getRulesByDepartment(String department) {

        return complianceRuleRepository
                .findByApplicableDepartment(department)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // ENTITY -> RESPONSE DTO
    // ============================================================

    private ComplianceRuleResponseDTO convertToResponseDTO(
            ComplianceRule rule) {

        ComplianceRuleResponseDTO dto =
                new ComplianceRuleResponseDTO();

        dto.setId(rule.getId());

        dto.setRuleCode(rule.getRuleCode());
        dto.setRuleName(rule.getRuleName());
        dto.setDescription(rule.getDescription());
        dto.setRuleType(rule.getRuleType());

        dto.setApplicableDepartment(
                rule.getApplicableDepartment());

        dto.setApplicableProcess(
                rule.getApplicableProcess());

        dto.setControlRequirement(
                rule.getControlRequirement());

        dto.setEvidenceRequired(
                rule.getEvidenceRequired());

        dto.setFrequency(
                rule.getFrequency());

        dto.setStatus(
                rule.getStatus());

        // Regulatory Requirement
        if (rule.getRegulatoryRequirement() != null) {

            RegulatoryRequirement regulatoryRequirement =
                    rule.getRegulatoryRequirement();

            dto.setRegulatoryRequirementId(
                    regulatoryRequirement.getId());

            dto.setRegulatoryRequirementCode(
                    regulatoryRequirement.getRequirementCode());

            dto.setRegulatoryRequirementTitle(
                    regulatoryRequirement.getTitle());
        }

        dto.setCreatedAt(rule.getCreatedAt());
        dto.setUpdatedAt(rule.getUpdatedAt());

        return dto;
    }
}