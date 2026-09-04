package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.ComplianceRuleRequest;
import com.example.audit_risk_management.dto.ComplianceRuleResponseDTO;
import com.example.audit_risk_management.service.ComplianceRuleService;

@RestController
@RequestMapping("/api/compliance-rules")
@CrossOrigin(origins = "*")
public class ComplianceRuleController {

    private final ComplianceRuleService complianceRuleService;

    public ComplianceRuleController(
            ComplianceRuleService complianceRuleService) {

        this.complianceRuleService = complianceRuleService;
    }


    // ============================================================
    // CREATE COMPLIANCE RULE
    // Permission: COMPLIANCE_RULE_CREATE
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_CREATE')")
    @PostMapping
    public ResponseEntity<ComplianceRuleResponseDTO>
    createComplianceRule(
            @RequestBody ComplianceRuleRequest request) {

        ComplianceRuleResponseDTO response =
                complianceRuleService.createComplianceRule(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ============================================================
    // GET ALL COMPLIANCE RULES
    // Permission: COMPLIANCE_RULE_VIEW
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_VIEW')")
    @GetMapping
    public ResponseEntity<List<ComplianceRuleResponseDTO>>
    getAllComplianceRules() {

        List<ComplianceRuleResponseDTO> response =
                complianceRuleService.getAllComplianceRules();

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // GET COMPLIANCE RULE BY ID
    // Permission: COMPLIANCE_RULE_VIEW
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<ComplianceRuleResponseDTO>
    getComplianceRuleById(
            @PathVariable Long id) {

        ComplianceRuleResponseDTO response =
                complianceRuleService.getComplianceRuleById(id);

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // UPDATE COMPLIANCE RULE
    // Permission: COMPLIANCE_RULE_UPDATE
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<ComplianceRuleResponseDTO>
    updateComplianceRule(
            @PathVariable Long id,
            @RequestBody ComplianceRuleRequest request) {

        ComplianceRuleResponseDTO response =
                complianceRuleService.updateComplianceRule(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // DELETE COMPLIANCE RULE
    // Permission: COMPLIANCE_RULE_DELETE
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplianceRule(
            @PathVariable Long id) {

        complianceRuleService.deleteComplianceRule(id);

        return ResponseEntity.noContent().build();
    }


    // ============================================================
    // GET RULES BY REGULATORY REQUIREMENT
    // Permission: COMPLIANCE_RULE_VIEW_BY_REGULATORY
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_VIEW_BY_REGULATORY')")
    @GetMapping("/regulatory/{regulatoryRequirementId}")
    public ResponseEntity<List<ComplianceRuleResponseDTO>>
    getRulesByRegulatoryRequirement(
            @PathVariable Long regulatoryRequirementId) {

        List<ComplianceRuleResponseDTO> response =
                complianceRuleService
                        .getRulesByRegulatoryRequirement(
                                regulatoryRequirementId
                        );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // GET RULES BY DEPARTMENT
    // Permission: COMPLIANCE_RULE_VIEW_BY_DEPARTMENT
    // ============================================================

    @PreAuthorize("hasAuthority('COMPLIANCE_RULE_VIEW_BY_DEPARTMENT')")
    @GetMapping("/department/{department}")
    public ResponseEntity<List<ComplianceRuleResponseDTO>>
    getRulesByDepartment(
            @PathVariable String department) {

        List<ComplianceRuleResponseDTO> response =
                complianceRuleService
                        .getRulesByDepartment(department);

        return ResponseEntity.ok(response);
    }
}