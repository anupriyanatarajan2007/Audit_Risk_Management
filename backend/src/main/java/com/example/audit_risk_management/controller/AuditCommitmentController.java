package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.AuditCommitmentRequest;
import com.example.audit_risk_management.dto.AuditCommitmentResponse;
import com.example.audit_risk_management.service.AuditCommitmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/audit-commitments")
@CrossOrigin(origins = "*")
public class AuditCommitmentController {

    private final AuditCommitmentService auditCommitmentService;

    public AuditCommitmentController(
            AuditCommitmentService auditCommitmentService) {

        this.auditCommitmentService = auditCommitmentService;
    }


    // =========================================================
    // CREATE AUDIT COMMITMENT
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_CREATE')")
    public ResponseEntity<AuditCommitmentResponse> create(
            @Valid @RequestBody AuditCommitmentRequest request) {

        AuditCommitmentResponse response =
                auditCommitmentService.create(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }


    // =========================================================
    // GET ALL COMMITMENTS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<List<AuditCommitmentResponse>> getAll() {

        List<AuditCommitmentResponse> response =
                auditCommitmentService.getAll();

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET COMMITMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<AuditCommitmentResponse> getById(
            @PathVariable Long id) {

        AuditCommitmentResponse response =
                auditCommitmentService.getById(id);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET COMMITMENTS BY AUDITOR
    // =========================================================

    @GetMapping("/auditor/{auditorId}")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<List<AuditCommitmentResponse>> getByAuditor(
            @PathVariable Long auditorId) {

        List<AuditCommitmentResponse> response =
                auditCommitmentService.getByAuditor(auditorId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET ACTIVE COMMITMENTS OF AUDITOR
    // =========================================================

    @GetMapping("/auditor/{auditorId}/active")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<List<AuditCommitmentResponse>> getActiveByAuditor(
            @PathVariable Long auditorId) {

        List<AuditCommitmentResponse> response =
                auditCommitmentService.getActiveByAuditor(auditorId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // CHECK AUDITOR AVAILABILITY
    // =========================================================

    @GetMapping("/auditor/{auditorId}/availability")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_AVAILABILITY_VIEW')")
    public ResponseEntity<Boolean> checkAuditorAvailability(
            @PathVariable Long auditorId) {

        boolean available =
                auditCommitmentService.isAuditorAvailable(auditorId);

        return ResponseEntity.ok(available);
    }


    // =========================================================
    // GET COMMITMENTS BY AUDITEE
    // =========================================================

    @GetMapping("/auditee/{auditeeId}")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<List<AuditCommitmentResponse>> getByAuditee(
            @PathVariable Long auditeeId) {

        List<AuditCommitmentResponse> response =
                auditCommitmentService.getByAuditee(auditeeId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET ACTIVE COMMITMENTS OF AUDITEE
    // =========================================================

    @GetMapping("/auditee/{auditeeId}/active")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<List<AuditCommitmentResponse>> getActiveByAuditee(
            @PathVariable Long auditeeId) {

        List<AuditCommitmentResponse> response =
                auditCommitmentService.getActiveByAuditee(auditeeId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET AUDITEE WORKLOAD
    // =========================================================
    //
    // Returns number of active commitments:
    // PENDING + IN_PROGRESS
    //
    // Used by Audit Manager while selecting an Auditee.
    // =========================================================

    @GetMapping("/auditee/{auditeeId}/workload")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<Long> getAuditeeWorkload(
            @PathVariable Long auditeeId) {

        long workload =
                auditCommitmentService.getAuditeeWorkload(
                        auditeeId
                );

        return ResponseEntity.ok(workload);
    }


    // =========================================================
    // GET COMMITMENTS BY AUDIT
    // =========================================================

    @GetMapping("/audit/{auditId}")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_VIEW')")
    public ResponseEntity<List<AuditCommitmentResponse>> getByAudit(
            @PathVariable Long auditId) {

        List<AuditCommitmentResponse> response =
                auditCommitmentService.getByAudit(auditId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE COMMITMENT STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_STATUS_UPDATE')")
    public ResponseEntity<AuditCommitmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        AuditCommitmentResponse response =
                auditCommitmentService.updateStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE COMMITMENT
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDIT_COMMITMENT_DELETE')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        auditCommitmentService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
