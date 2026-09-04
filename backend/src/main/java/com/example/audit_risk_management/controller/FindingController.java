package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.FindingRequestDTO;
import com.example.audit_risk_management.dto.FindingResponseDTO;
import com.example.audit_risk_management.enums.FindingStatus;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.service.FindingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/findings")
@CrossOrigin(origins = "*")
public class FindingController {

    @Autowired
    private FindingService findingService;


    // =========================================================
    // CREATE
    // Existing Permission: FINDING_CREATE
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_CREATE')")
    @PostMapping
    public ResponseEntity<ApiResponse<FindingResponseDTO>> createFinding(
            @Valid @RequestBody FindingRequestDTO requestDTO) {

        FindingResponseDTO response =
                findingService.createFinding(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Finding created successfully",
                                response
                        )
                );
    }


    // =========================================================
    // GET BY ID
    // Existing Permission: FINDING_VIEW
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FindingResponseDTO>> getFindingById(
            @PathVariable Long id) {

        FindingResponseDTO response =
                findingService.getFindingById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Finding retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET ALL
    // New Permission: FINDING_VIEW_ALL
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_ALL')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>> getAllFindings() {

        List<FindingResponseDTO> response =
                findingService.getAllFindings();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Findings retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET BY AUDIT
    // Existing Permission: FINDING_VIEW_BY_AUDIT
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_BY_AUDIT')")
    @GetMapping("/audit/{auditId}")
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>> getFindingsByAuditId(
            @PathVariable Long auditId) {

        List<FindingResponseDTO> response =
                findingService.getFindingsByAuditId(auditId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audit findings retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET BY AUDITOR
    // New Permission: FINDING_VIEW_BY_AUDITOR
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_BY_AUDITOR')")
    @GetMapping("/auditor/{auditorId}")
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>> getFindingsByAuditorId(
            @PathVariable Long auditorId) {

        List<FindingResponseDTO> response =
                findingService.getFindingsByAuditorId(auditorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Auditor findings retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET BY STATUS
    // New Permission: FINDING_VIEW_BY_STATUS
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_BY_STATUS')")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>> getFindingsByStatus(
            @PathVariable FindingStatus status) {

        List<FindingResponseDTO> response =
                findingService.getFindingsByStatus(status);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Findings by status retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET BY RISK LEVEL
    // New Permission: FINDING_VIEW_BY_RISK_LEVEL
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_BY_RISK_LEVEL')")
    @GetMapping("/risk-level/{riskLevel}")
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>> getFindingsByRiskLevel(
            @PathVariable RiskLevel riskLevel) {

        List<FindingResponseDTO> response =
                findingService.getFindingsByRiskLevel(riskLevel);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Findings by risk level retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET AUDITOR + STATUS
    // New Permission: FINDING_VIEW_AUDITOR_STATUS
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_AUDITOR_STATUS')")
    @GetMapping("/auditor/{auditorId}/status/{status}")
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>>
    getFindingsByAuditorAndStatus(
            @PathVariable Long auditorId,
            @PathVariable FindingStatus status) {

        List<FindingResponseDTO> response =
                findingService.getFindingsByAuditorAndStatus(
                        auditorId,
                        status
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Auditor findings by status retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET AUDIT + RISK LEVEL
    // New Permission: FINDING_VIEW_AUDIT_RISK_LEVEL
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_VIEW_AUDIT_RISK_LEVEL')")
    @GetMapping("/audit/{auditId}/risk-level/{riskLevel}")
    public ResponseEntity<ApiResponse<List<FindingResponseDTO>>>
    getFindingsByAuditAndRiskLevel(
            @PathVariable Long auditId,
            @PathVariable RiskLevel riskLevel) {

        List<FindingResponseDTO> response =
                findingService.getFindingsByAuditAndRiskLevel(
                        auditId,
                        riskLevel
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Audit findings by risk level retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // UPDATE
    // Existing Permission: FINDING_UPDATE
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FindingResponseDTO>> updateFinding(
            @PathVariable Long id,
            @Valid @RequestBody FindingRequestDTO requestDTO) {

        FindingResponseDTO response =
                findingService.updateFinding(
                        id,
                        requestDTO
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Finding updated successfully",
                        response
                )
        );
    }


    // =========================================================
    // DELETE
    // Existing Permission: FINDING_DELETE
    // =========================================================

    @PreAuthorize("hasAuthority('FINDING_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFinding(
            @PathVariable Long id) {

        findingService.deleteFinding(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Finding deleted successfully",
                        "Deleted"
                )
        );
    }
}