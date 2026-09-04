package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.AuditRequestDTO;
import com.example.audit_risk_management.dto.AuditResponseDTO;
import com.example.audit_risk_management.service.AuditService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/audits")
@CrossOrigin(origins = "*")
public class AuditController {

    @Autowired
    private AuditService auditService;


    // =========================================================
    // CREATE AUDIT
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('AUDIT_CREATE')")
    public ResponseEntity<ApiResponse<AuditResponseDTO>> createAudit(
            @Valid @RequestBody AuditRequestDTO dto) {

        AuditResponseDTO response =
                auditService.createAudit(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Audit created successfully",
                        response));
    }


    // =========================================================
    // GET ALL AUDITS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public ResponseEntity<ApiResponse<List<AuditResponseDTO>>> getAllAudits() {

        List<AuditResponseDTO> audits =
                auditService.getAllAudits();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audits fetched successfully",
                        audits));
    }


    // =========================================================
    // GET AUDIT BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public ResponseEntity<ApiResponse<AuditResponseDTO>> getAuditById(
            @PathVariable Long id) {

        AuditResponseDTO audit =
                auditService.getAuditById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audit fetched successfully",
                        audit));
    }


    // =========================================================
    // UPDATE AUDIT
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDIT_UPDATE')")
    public ResponseEntity<ApiResponse<AuditResponseDTO>> updateAudit(
            @PathVariable Long id,
            @Valid @RequestBody AuditRequestDTO dto) {

        AuditResponseDTO updatedAudit =
                auditService.updateAudit(id, dto);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audit updated successfully",
                        updatedAudit));
    }


    // =========================================================
    // DELETE AUDIT
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDIT_DELETE')")
    public ResponseEntity<ApiResponse<String>> deleteAudit(
            @PathVariable Long id) {

        auditService.deleteAudit(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audit deleted successfully",
                        null));
    }


    // =========================================================
    // ASSIGN INTERNAL AUDITOR
    // =========================================================

    @PutMapping("/{auditId}/assign/{auditorId}")
    @PreAuthorize("hasAuthority('AUDIT_ASSIGN')")
    public ResponseEntity<ApiResponse<AuditResponseDTO>>
            assignInternalAuditor(
                    @PathVariable Long auditId,
                    @PathVariable Long auditorId) {

        AuditResponseDTO audit =
                auditService.assignInternalAuditor(
                        auditId,
                        auditorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Internal Auditor assigned successfully",
                        audit));
    }


    // =========================================================
    // UPDATE AUDIT STATUS
    // =========================================================

    @PutMapping("/{auditId}/status")
    @PreAuthorize("hasAuthority('AUDIT_STATUS_UPDATE')")
    public ResponseEntity<ApiResponse<AuditResponseDTO>>
            updateAuditStatus(
                    @PathVariable Long auditId,
                    @RequestParam String status) {

        AuditResponseDTO audit =
                auditService.updateAuditStatus(
                        auditId,
                        status);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audit status updated successfully",
                        audit));
    }


    // =========================================================
    // MY ASSIGNED AUDITS
    // INTERNAL AUDITOR
    // =========================================================

    @GetMapping("/my-assigned")
    @PreAuthorize("hasAuthority('AUDIT_ASSIGNED_VIEW')")
    public ResponseEntity<ApiResponse<List<AuditResponseDTO>>>
            getMyAssignedAudits() {

        List<AuditResponseDTO> audits =
                auditService.getAuditsForCurrentInternalAuditor();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Assigned audits retrieved successfully",
                        audits));
    }


    // =========================================================
    // MY AUDITS
    // AUDITEE
    // =========================================================

    @GetMapping("/my-audits")
    @PreAuthorize("hasAuthority('AUDIT_MY_VIEW')")
    public ResponseEntity<ApiResponse<List<AuditResponseDTO>>>
            getMyAudits() {

        List<AuditResponseDTO> audits =
                auditService.getAuditsForCurrentAuditee();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Auditee audits retrieved successfully",
                        audits));
    }
}
