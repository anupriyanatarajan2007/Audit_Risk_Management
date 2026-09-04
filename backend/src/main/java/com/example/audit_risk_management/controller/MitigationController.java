package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.MitigationRequestDTO;
import com.example.audit_risk_management.dto.MitigationResponseDTO;
import com.example.audit_risk_management.enums.MitigationStatus;
import com.example.audit_risk_management.service.MitigationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mitigations")
@CrossOrigin(origins = "*")
public class MitigationController {

    @Autowired
    private MitigationService mitigationService;


    // ============================================================
    // CREATE
    // POST /api/mitigations
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAuthority('MITIGATION_CREATE')")
    public ResponseEntity<ApiResponse<MitigationResponseDTO>> createMitigation(
            @Valid @RequestBody MitigationRequestDTO request) {

        return ResponseEntity.ok(
                mitigationService.createMitigation(request));
    }


    // ============================================================
    // GET ALL
    // GET /api/mitigations
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAuthority('MITIGATION_READ')")
    public ResponseEntity<ApiResponse<List<MitigationResponseDTO>>> getAllMitigations() {

        return ResponseEntity.ok(
                mitigationService.getAllMitigations());
    }


    // ============================================================
    // GET BY MITIGATION ID
    // GET /api/mitigations/{mitigationId}
    // ============================================================

    @GetMapping("/{mitigationId}")
    @PreAuthorize("hasAuthority('MITIGATION_READ')")
    public ResponseEntity<ApiResponse<MitigationResponseDTO>> getMitigationById(
            @PathVariable String mitigationId) {

        return ResponseEntity.ok(
                mitigationService.getMitigationById(mitigationId));
    }


    // ============================================================
    // GET BY RISK
    // GET /api/mitigations/risk/{riskId}
    // ============================================================

    @GetMapping("/risk/{riskId}")
    @PreAuthorize("hasAuthority('MITIGATION_READ')")
    public ResponseEntity<ApiResponse<List<MitigationResponseDTO>>> getMitigationsByRisk(
            @PathVariable Long riskId) {

        return ResponseEntity.ok(
                mitigationService.getMitigationsByRisk(riskId));
    }


    // ============================================================
    // GET BY OWNER
    // GET /api/mitigations/owner/{ownerId}
    // ============================================================

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAuthority('MITIGATION_READ')")
    public ResponseEntity<ApiResponse<List<MitigationResponseDTO>>> getMitigationsByOwner(
            @PathVariable Long ownerId) {

        return ResponseEntity.ok(
                mitigationService.getMitigationsByOwner(ownerId));
    }


    // ============================================================
    // UPDATE
    // PUT /api/mitigations/{mitigationId}
    // ============================================================

    @PutMapping("/{mitigationId}")
    @PreAuthorize("hasAuthority('MITIGATION_UPDATE')")
    public ResponseEntity<ApiResponse<MitigationResponseDTO>> updateMitigation(
            @PathVariable String mitigationId,
            @Valid @RequestBody MitigationRequestDTO request) {

        return ResponseEntity.ok(
                mitigationService.updateMitigation(
                        mitigationId,
                        request));
    }


    // ============================================================
    // DELETE
    // DELETE /api/mitigations/{mitigationId}
    // ============================================================

    @DeleteMapping("/{mitigationId}")
    @PreAuthorize("hasAuthority('MITIGATION_DELETE')")
    public ResponseEntity<ApiResponse<String>> deleteMitigation(
            @PathVariable String mitigationId) {

        return ResponseEntity.ok(
                mitigationService.deleteMitigation(mitigationId));
    }


    // ============================================================
    // UPDATE STATUS
    // PATCH /api/mitigations/{mitigationId}/status
    // ============================================================

    @PatchMapping("/{mitigationId}/status")
    @PreAuthorize("hasAuthority('MITIGATION_STATUS_UPDATE')")
    public ResponseEntity<ApiResponse<MitigationResponseDTO>> updateStatus(
            @PathVariable String mitigationId,
            @RequestParam MitigationStatus status) {

        return ResponseEntity.ok(
                mitigationService.updateStatus(
                        mitigationId,
                        status));
    }


    // ============================================================
    // ASSIGN OWNER
    // PATCH /api/mitigations/{mitigationId}/assign/{ownerId}
    // ============================================================

    @PatchMapping("/{mitigationId}/assign/{ownerId}")
    @PreAuthorize("hasAuthority('MITIGATION_ASSIGN')")
    public ResponseEntity<ApiResponse<MitigationResponseDTO>> assignOwner(
            @PathVariable String mitigationId,
            @PathVariable Long ownerId) {

        return ResponseEntity.ok(
                mitigationService.assignOwner(
                        mitigationId,
                        ownerId));
    }


    // ============================================================
    // COMPLETE MITIGATION
    // PATCH /api/mitigations/{mitigationId}/complete
    // ============================================================

    @PatchMapping("/{mitigationId}/complete")
    @PreAuthorize("hasAuthority('MITIGATION_COMPLETE')")
    public ResponseEntity<ApiResponse<MitigationResponseDTO>> completeMitigation(
            @PathVariable String mitigationId) {

        return ResponseEntity.ok(
                mitigationService.completeMitigation(
                        mitigationId));
    }


    // ============================================================
    // GET BY STATUS
    // GET /api/mitigations/status/{status}
    // ============================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('MITIGATION_READ')")
    public ResponseEntity<ApiResponse<List<MitigationResponseDTO>>> getByStatus(
            @PathVariable MitigationStatus status) {

        return ResponseEntity.ok(
                mitigationService.getByStatus(status));
    }


    // ============================================================
    // GET OVERDUE
    // GET /api/mitigations/overdue
    // ============================================================

    @GetMapping("/overdue")
    @PreAuthorize("hasAuthority('MITIGATION_OVERDUE')")
    public ResponseEntity<ApiResponse<List<MitigationResponseDTO>>> getOverdueMitigations() {

        return ResponseEntity.ok(
                mitigationService.getOverdueMitigations());
    }


    // ============================================================
    // DASHBOARD TOTAL
    // GET /api/mitigations/dashboard/total
    // ============================================================

    @GetMapping("/dashboard/total")
    @PreAuthorize("hasAuthority('MITIGATION_DASHBOARD')")
    public ResponseEntity<ApiResponse<Long>> getTotalMitigations() {

        return ResponseEntity.ok(
                mitigationService.getTotalMitigations());
    }


    // ============================================================
    // DASHBOARD COMPLETED
    // GET /api/mitigations/dashboard/completed
    // ============================================================

    @GetMapping("/dashboard/completed")
    @PreAuthorize("hasAuthority('MITIGATION_DASHBOARD')")
    public ResponseEntity<ApiResponse<Long>> getCompletedCount() {

        return ResponseEntity.ok(
                mitigationService.getCompletedCount());
    }


    // ============================================================
    // DASHBOARD PENDING
    // GET /api/mitigations/dashboard/pending
    // ============================================================

    @GetMapping("/dashboard/pending")
    @PreAuthorize("hasAuthority('MITIGATION_DASHBOARD')")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {

        return ResponseEntity.ok(
                mitigationService.getPendingCount());
    }


    // ============================================================
    // SEARCH
    // GET /api/mitigations/search?keyword=...
    // ============================================================

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('MITIGATION_SEARCH')")
    public ResponseEntity<ApiResponse<List<MitigationResponseDTO>>> search(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                mitigationService.search(keyword));
    }
}
