package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.AnnualAuditPlanRequestDTO;
import com.example.audit_risk_management.dto.AnnualAuditPlanResponseDTO;
import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;
import com.example.audit_risk_management.service.AnnualAuditPlanService;

@RestController
@RequestMapping("/api/annual-audit-plans")
@CrossOrigin(origins = "*")
public class AnnualAuditPlanController {

    private final AnnualAuditPlanService annualAuditPlanService;

    public AnnualAuditPlanController(
            AnnualAuditPlanService annualAuditPlanService) {

        this.annualAuditPlanService = annualAuditPlanService;
    }


    // =========================================================
    // CREATE ANNUAL AUDIT PLAN
    // AUDIT MANAGER
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_CREATE')")
    public ResponseEntity<AnnualAuditPlanResponseDTO> createPlan(
            @RequestBody AnnualAuditPlanRequestDTO requestDTO) {

        AnnualAuditPlanResponseDTO response =
                annualAuditPlanService.createPlan(requestDTO);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }


    // =========================================================
    // UPDATE ANNUAL AUDIT PLAN
    // AUDIT MANAGER
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_UPDATE')")
    public ResponseEntity<AnnualAuditPlanResponseDTO> updatePlan(
            @PathVariable Long id,
            @RequestBody AnnualAuditPlanRequestDTO requestDTO) {

        AnnualAuditPlanResponseDTO response =
                annualAuditPlanService.updatePlan(id, requestDTO);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET PLAN BY DATABASE ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_VIEW')")
    public ResponseEntity<AnnualAuditPlanResponseDTO> getPlanById(
            @PathVariable Long id) {

        AnnualAuditPlanResponseDTO response =
                annualAuditPlanService.getPlanById(id);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET PLAN BY PLAN ID
    // Example:
    // /api/annual-audit-plans/plan/AAP-001
    // =========================================================

    @GetMapping("/plan/{planId}")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_VIEW')")
    public ResponseEntity<AnnualAuditPlanResponseDTO> getPlanByPlanId(
            @PathVariable String planId) {

        AnnualAuditPlanResponseDTO response =
                annualAuditPlanService.getPlanByPlanId(planId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET ALL PLANS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_VIEW')")
    public ResponseEntity<List<AnnualAuditPlanResponseDTO>> getAllPlans() {

        List<AnnualAuditPlanResponseDTO> response =
                annualAuditPlanService.getAllPlans();

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET MY PLANS
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_VIEW')")
    public ResponseEntity<List<AnnualAuditPlanResponseDTO>> getMyPlans() {

        List<AnnualAuditPlanResponseDTO> response =
                annualAuditPlanService.getMyPlans();

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET PLANS BY YEAR
    // Example:
    // /api/annual-audit-plans/year/2026
    // =========================================================

    @GetMapping("/year/{year}")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_VIEW')")
    public ResponseEntity<List<AnnualAuditPlanResponseDTO>> getPlansByYear(
            @PathVariable Integer year) {

        List<AnnualAuditPlanResponseDTO> response =
                annualAuditPlanService.getPlansByYear(year);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET PLANS BY STATUS
    // Example:
    // /api/annual-audit-plans/status/DRAFT
    // =========================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_VIEW')")
    public ResponseEntity<List<AnnualAuditPlanResponseDTO>> getPlansByStatus(
            @PathVariable AnnualAuditPlanStatus status) {

        List<AnnualAuditPlanResponseDTO> response =
                annualAuditPlanService.getPlansByStatus(status);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE PLAN
    // AUDIT MANAGER
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_DELETE')")
    public ResponseEntity<Void> deletePlan(
            @PathVariable Long id) {

        annualAuditPlanService.deletePlan(id);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // CAE — APPROVE / REJECT PLAN
    // ONLY CAE
    // =========================================================

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ANNUAL_AUDIT_PLAN_STATUS_UPDATE')")
    public ResponseEntity<AnnualAuditPlanResponseDTO> updatePlanStatus(
            @PathVariable Long id,
            @RequestParam AnnualAuditPlanStatus status,
            @RequestParam(required = false) String reason) {

        AnnualAuditPlanResponseDTO updated =
                annualAuditPlanService.updatePlanStatus(
                        id,
                        status,
                        reason
                );

        return ResponseEntity.ok(updated);
    }
}
