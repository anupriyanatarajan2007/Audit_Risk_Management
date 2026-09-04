package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.AuditeeAssignmentRequestDTO;
import com.example.audit_risk_management.dto.AuditeeAssignmentResponseDTO;
import com.example.audit_risk_management.service.AuditeeAssignmentService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auditee-assignments")
public class AuditeeAssignmentController {

    private final AuditeeAssignmentService auditeeAssignmentService;

    public AuditeeAssignmentController(
            AuditeeAssignmentService auditeeAssignmentService) {

        this.auditeeAssignmentService = auditeeAssignmentService;
    }


    // ============================================================
    // ASSIGN AUDITEE
    // AUDIT MANAGER
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_CREATE')")
    public ResponseEntity<AuditeeAssignmentResponseDTO> assignAuditee(
            @Valid @RequestBody AuditeeAssignmentRequestDTO requestDTO) {

        AuditeeAssignmentResponseDTO response =
                auditeeAssignmentService.assignAuditee(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ============================================================
    // GET ALL ASSIGNMENTS
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_VIEW')")
    public ResponseEntity<List<AuditeeAssignmentResponseDTO>>
            getAllAssignments() {

        return ResponseEntity.ok(
                auditeeAssignmentService.getAllAssignments()
        );
    }


    // ============================================================
    // GET ASSIGNMENT BY ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_VIEW')")
    public ResponseEntity<AuditeeAssignmentResponseDTO>
            getAssignmentById(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                auditeeAssignmentService.getAssignmentById(id)
        );
    }


    // ============================================================
    // GET ASSIGNMENTS BY AUDIT
    // ============================================================

    @GetMapping("/audit/{auditId}")
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_VIEW')")
    public ResponseEntity<List<AuditeeAssignmentResponseDTO>>
            getByAudit(
                    @PathVariable Long auditId) {

        return ResponseEntity.ok(
                auditeeAssignmentService
                        .getAssignmentsByAudit(auditId)
        );
    }


    // ============================================================
    // GET ASSIGNMENTS BY AUDITEE
    // ============================================================

    @GetMapping("/auditee/{auditeeId}")
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_VIEW')")
    public ResponseEntity<List<AuditeeAssignmentResponseDTO>>
            getByAuditee(
                    @PathVariable Long auditeeId) {

        return ResponseEntity.ok(
                auditeeAssignmentService
                        .getAssignmentsByAuditee(auditeeId)
        );
    }


    // ============================================================
    // GET ASSIGNMENTS BY AUDIT MANAGER
    // ============================================================

    @GetMapping("/assigned-by/{assignedById}")
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_VIEW')")
    public ResponseEntity<List<AuditeeAssignmentResponseDTO>>
            getByAssignedBy(
                    @PathVariable Long assignedById) {

        return ResponseEntity.ok(
                auditeeAssignmentService
                        .getAssignmentsByAssignedBy(assignedById)
        );
    }


    // ============================================================
    // UPDATE STATUS
    // AUDIT MANAGER
    // ============================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_STATUS_UPDATE')")
    public ResponseEntity<AuditeeAssignmentResponseDTO>
            updateStatus(
                    @PathVariable Long id,
                    @RequestParam String status) {

        return ResponseEntity.ok(
                auditeeAssignmentService
                        .updateStatus(id, status)
        );
    }


    // ============================================================
    // DELETE ASSIGNMENT
    // AUDIT MANAGER
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDITEE_ASSIGNMENT_DELETE')")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id) {

        auditeeAssignmentService.deleteAssignment(id);

        return ResponseEntity.noContent().build();
    }
}
