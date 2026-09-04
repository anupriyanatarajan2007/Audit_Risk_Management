package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.audit_risk_management.model.Evidence;
import com.example.audit_risk_management.service.EvidenceService;

@RestController
@RequestMapping("/api/evidence")
@CrossOrigin(origins = "*")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    // ============================================================
    // UPLOAD EVIDENCE
    //
    // Audit-level:
    //   auditId = 1
    //   findingId = not provided
    //
    // Finding-level:
    //   auditId = 1
    //   findingId = 10
    //
    // Audit is mandatory.
    // Finding is optional.
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_UPLOAD')")
    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<Evidence> uploadEvidence(

            @RequestParam("auditId")
            Long auditId,

            @RequestParam(value = "findingId", required = false)
            Long findingId,

            @RequestParam("userId")
            Long userId,

            @RequestParam("file")
            MultipartFile file,

            @RequestParam(value = "description", required = false)
            String description

    ) {

        Evidence evidence = evidenceService.uploadEvidence(
                auditId,
                findingId,
                userId,
                file,
                description
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(evidence);
    }


    // ============================================================
    // GET EVIDENCE BY ID
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/{evidenceId}")
    public ResponseEntity<Evidence> getEvidenceById(

            @PathVariable Long evidenceId

    ) {

        Evidence evidence =
                evidenceService.getEvidenceById(evidenceId);

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // GET ALL EVIDENCE
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping
    public ResponseEntity<List<Evidence>> getAllEvidence() {

        List<Evidence> evidence =
                evidenceService.getAllEvidence();

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // GET ALL EVIDENCE FOR AN AUDIT
    //
    // Includes:
    // 1. Audit-level evidence
    // 2. Finding-level evidence belonging to that audit
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/audit/{auditId}")
    public ResponseEntity<List<Evidence>> getEvidenceByAudit(

            @PathVariable Long auditId

    ) {

        List<Evidence> evidence =
                evidenceService.getEvidenceByAudit(auditId);

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // GET ALL EVIDENCE FOR A FINDING
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/finding/{findingId}")
    public ResponseEntity<List<Evidence>> getEvidenceByFinding(

            @PathVariable Long findingId

    ) {

        List<Evidence> evidence =
                evidenceService.getEvidenceByFinding(findingId);

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // GET EVIDENCE FOR SPECIFIC AUDIT + FINDING
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/audit/{auditId}/finding/{findingId}")
    public ResponseEntity<List<Evidence>> getEvidenceByAuditAndFinding(

            @PathVariable Long auditId,

            @PathVariable Long findingId

    ) {

        List<Evidence> evidence =
                evidenceService.getEvidenceByAuditAndFinding(
                        auditId,
                        findingId
                );

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // GET EVIDENCE FOR FINDING BY STATUS
    //
    // Example:
    // /api/evidence/finding/10/status/PENDING
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/finding/{findingId}/status/{status}")
    public ResponseEntity<List<Evidence>> getEvidenceByFindingAndStatus(

            @PathVariable Long findingId,

            @PathVariable String status

    ) {

        try {

            com.example.audit_risk_management.enums.EvidenceStatus
                    evidenceStatus =
                    com.example.audit_risk_management.enums.EvidenceStatus
                            .valueOf(status.toUpperCase());

            List<Evidence> evidence =
                    evidenceService.getEvidenceByFindingAndStatus(
                            findingId,
                            evidenceStatus
                    );

            return ResponseEntity.ok(evidence);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }


    // ============================================================
    // GET EVIDENCE UPLOADED BY USER
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Evidence>> getEvidenceByUser(

            @PathVariable Long userId

    ) {

        List<Evidence> evidence =
                evidenceService.getEvidenceByUser(userId);

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // GET PENDING EVIDENCE
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_VIEW')")
    @GetMapping("/pending")
    public ResponseEntity<List<Evidence>> getPendingEvidence() {

        List<Evidence> evidence =
                evidenceService.getPendingEvidence();

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // APPROVE EVIDENCE
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_APPROVE')")
    @PutMapping("/{evidenceId}/approve")
    public ResponseEntity<Evidence> approveEvidence(

            @PathVariable Long evidenceId

    ) {

        Evidence evidence =
                evidenceService.approveEvidence(evidenceId);

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // REJECT EVIDENCE
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_REJECT')")
    @PutMapping("/{evidenceId}/reject")
    public ResponseEntity<Evidence> rejectEvidence(

            @PathVariable Long evidenceId

    ) {

        Evidence evidence =
                evidenceService.rejectEvidence(evidenceId);

        return ResponseEntity.ok(evidence);
    }


    // ============================================================
    // DELETE EVIDENCE
    // ============================================================

    @PreAuthorize("hasAuthority('EVIDENCE_DELETE')")
    @DeleteMapping("/{evidenceId}")
    public ResponseEntity<Void> deleteEvidence(

            @PathVariable Long evidenceId

    ) {

        evidenceService.deleteEvidence(evidenceId);

        return ResponseEntity
                .noContent()
                .build();
    }
}