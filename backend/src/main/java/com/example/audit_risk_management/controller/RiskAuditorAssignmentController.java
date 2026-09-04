package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.RiskAuditorAssignmentRequest;
import com.example.audit_risk_management.dto.RiskAuditorAssignmentResponse;
import com.example.audit_risk_management.enums.AssignmentPriority;
import com.example.audit_risk_management.enums.AssignmentStatus;
import com.example.audit_risk_management.service.RiskAuditorAssignmentService;

@RestController
@RequestMapping("/api/risk-auditor-assignments")
@CrossOrigin(origins = "*")
public class RiskAuditorAssignmentController {

    private final RiskAuditorAssignmentService assignmentService;

    public RiskAuditorAssignmentController(
            RiskAuditorAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }


    // =========================================================
    // CREATE ASSIGNMENT
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_CREATE')")
    @PostMapping
    public ResponseEntity<RiskAuditorAssignmentResponse> createAssignment(
            @RequestBody RiskAuditorAssignmentRequest request) {

        RiskAuditorAssignmentResponse response =
                assignmentService.createAssignment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL ASSIGNMENTS
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW')")
    @GetMapping
    public ResponseEntity<List<RiskAuditorAssignmentResponse>> getAllAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllAssignments()
        );
    }


    // =========================================================
    // GET ASSIGNMENT BY ID
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<RiskAuditorAssignmentResponse> getAssignmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(id)
        );
    }


    // =========================================================
    // GET ASSIGNMENTS BY RISK ID
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW_BY_RISK')")
    @GetMapping("/risk/{riskId}")
    public ResponseEntity<List<RiskAuditorAssignmentResponse>> getByRiskId(
            @PathVariable String riskId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByRiskId(riskId)
        );
    }


    // =========================================================
    // GET ASSIGNMENTS BY AUDITOR EMPLOYEE ID
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW_BY_AUDITOR')")
    @GetMapping("/auditor/{employeeId}")
    public ResponseEntity<List<RiskAuditorAssignmentResponse>> getByAuditor(
            @PathVariable String employeeId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByAuditor(employeeId)
        );
    }


    // =========================================================
    // GET ASSIGNMENTS BY STATUS
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW_BY_STATUS')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RiskAuditorAssignmentResponse>> getByStatus(
            @PathVariable AssignmentStatus status) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByStatus(status)
        );
    }


    // =========================================================
    // GET ASSIGNMENTS BY AUDITOR + STATUS
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW_BY_AUDITOR_STATUS')")
    @GetMapping("/auditor/{employeeId}/status/{status}")
    public ResponseEntity<List<RiskAuditorAssignmentResponse>>
            getByAuditorAndStatus(
                    @PathVariable String employeeId,
                    @PathVariable AssignmentStatus status) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByAuditorAndStatus(
                        employeeId,
                        status
                )
        );
    }


    // =========================================================
    // GET ASSIGNMENTS CREATED BY AUDIT MANAGER
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_VIEW_BY_ASSIGNED_BY')")
    @GetMapping("/assigned-by/{employeeId}")
    public ResponseEntity<List<RiskAuditorAssignmentResponse>>
            getByAssignedBy(
                    @PathVariable String employeeId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByAssignedBy(employeeId)
        );
    }


    // =========================================================
    // UPDATE ASSIGNMENT STATUS
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_UPDATE_STATUS')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<RiskAuditorAssignmentResponse>
            updateStatus(
                    @PathVariable Long id,
                    @RequestParam AssignmentStatus status) {

        return ResponseEntity.ok(
                assignmentService.updateStatus(id, status)
        );
    }


    // =========================================================
    // UPDATE ASSIGNMENT PRIORITY
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_UPDATE_PRIORITY')")
    @PatchMapping("/{id}/priority")
    public ResponseEntity<RiskAuditorAssignmentResponse>
            updatePriority(
                    @PathVariable Long id,
                    @RequestParam AssignmentPriority priority) {

        return ResponseEntity.ok(
                assignmentService.updatePriority(id, priority)
        );
    }


    // =========================================================
    // DELETE ASSIGNMENT
    // =========================================================

    @PreAuthorize("hasAuthority('RISK_AUDITOR_ASSIGNMENT_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id) {

        assignmentService.deleteAssignment(id);

        return ResponseEntity.noContent().build();
    }
}