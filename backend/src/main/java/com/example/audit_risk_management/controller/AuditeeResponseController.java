package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.AuditeeResponseRequestDTO;
import com.example.audit_risk_management.dto.AuditeeResponseResponseDTO;
import com.example.audit_risk_management.enums.AuditeeResponseStatus;
import com.example.audit_risk_management.service.AuditeeResponseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auditee-responses")
@CrossOrigin(origins = "*")
public class AuditeeResponseController {

    private final AuditeeResponseService auditeeResponseService;

    public AuditeeResponseController(
            AuditeeResponseService auditeeResponseService) {

        this.auditeeResponseService = auditeeResponseService;
    }


    // ============================================================
    // SUBMIT RESPONSE
    // AUDITEE
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_CREATE')")
    public ResponseEntity<ApiResponse<AuditeeResponseResponseDTO>>
            submitResponse(
                    @Valid @RequestBody
                    AuditeeResponseRequestDTO requestDTO) {

        AuditeeResponseResponseDTO response =
                auditeeResponseService.submitResponse(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Auditee response submitted successfully",
                                response
                        )
                );
    }


    // ============================================================
    // GET RESPONSE BY ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_VIEW')")
    public ResponseEntity<ApiResponse<AuditeeResponseResponseDTO>>
            getResponseById(
                    @PathVariable Long id) {

        AuditeeResponseResponseDTO response =
                auditeeResponseService.getResponseById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Auditee response retrieved successfully",
                        response
                )
        );
    }


    // ============================================================
    // GET RESPONSES BY FINDING
    // ============================================================

    @GetMapping("/finding/{findingId}")
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_VIEW')")
    public ResponseEntity<ApiResponse<List<AuditeeResponseResponseDTO>>>
            getResponsesByFinding(
                    @PathVariable Long findingId) {

        List<AuditeeResponseResponseDTO> responses =
                auditeeResponseService
                        .getResponsesByFinding(findingId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Responses for finding retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // GET RESPONSES BY AUDITEE
    // ============================================================

    @GetMapping("/auditee/{auditeeId}")
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_VIEW')")
    public ResponseEntity<ApiResponse<List<AuditeeResponseResponseDTO>>>
            getResponsesByAuditee(
                    @PathVariable Long auditeeId) {

        List<AuditeeResponseResponseDTO> responses =
                auditeeResponseService
                        .getResponsesByAuditee(auditeeId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Auditee responses retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // GET ALL RESPONSES
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_VIEW')")
    public ResponseEntity<ApiResponse<List<AuditeeResponseResponseDTO>>>
            getAllResponses() {

        List<AuditeeResponseResponseDTO> responses =
                auditeeResponseService.getAllResponses();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "All auditee responses retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // DELETE RESPONSE
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_DELETE')")
    public ResponseEntity<ApiResponse<String>>
            deleteResponse(
                    @PathVariable Long id) {

        auditeeResponseService.deleteResponse(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Auditee response deleted successfully",
                        "Deleted"
                )
        );
    }


    // ============================================================
    // UPDATE RESPONSE STATUS
    // INTERNAL AUDITOR
    // ============================================================

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('AUDITEE_RESPONSE_STATUS_UPDATE')")
    public ResponseEntity<AuditeeResponseResponseDTO>
            updateResponseStatus(
                    @PathVariable Long id,
                    @RequestParam
                    AuditeeResponseStatus status) {

        AuditeeResponseResponseDTO response =
                auditeeResponseService.updateResponseStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(response);
    }
}
