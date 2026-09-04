package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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
import com.example.audit_risk_management.dto.RiskRequestDTO;
import com.example.audit_risk_management.dto.RiskResponseDTO;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.enums.RiskStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.service.RiskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/risks")
@CrossOrigin("*")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    // =========================================================
    // CREATE RISK
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('RISK_CREATE')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>> createRisk(
            @Valid @RequestBody RiskRequestDTO requestDTO) {

        RiskResponseDTO response =
                riskService.createRisk(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Risk created successfully",
                        response));
    }

    // =========================================================
    // UPDATE RISK
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RISK_UPDATE')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>> updateRisk(
            @PathVariable Long id,
            @Valid @RequestBody RiskRequestDTO requestDTO) {

        RiskResponseDTO response =
                riskService.updateRisk(id, requestDTO);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risk updated successfully",
                        response));
    }

    // =========================================================
    // GET RISK BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>> getRiskById(
            @PathVariable Long id) {

        RiskResponseDTO response =
                riskService.getRiskById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risk retrieved successfully",
                        response));
    }

    // =========================================================
    // GET RISK BY RISK ID
    // =========================================================

    @GetMapping("/riskId/{riskId}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>> getRiskByRiskId(
            @PathVariable String riskId) {

        RiskResponseDTO response =
                riskService.getRiskByRiskId(riskId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risk retrieved successfully",
                        response));
    }

    // =========================================================
    // GET ALL RISKS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>> getAllRisks() {

        List<RiskResponseDTO> response =
                riskService.getAllRisks();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risks retrieved successfully",
                        response));
    }

    // =========================================================
    // GET RISKS BY RISK OFFICER
    // =========================================================

    @GetMapping("/identified-by/{userId}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getRisksByIdentifiedBy(
            @PathVariable Long userId) {

        List<RiskResponseDTO> response =
                riskService.getRisksByIdentifiedBy(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risks retrieved successfully",
                        response));
    }

    // =========================================================
    // GET RISKS ASSIGNED TO USER
    // =========================================================

    @GetMapping("/assigned-to/{userId}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getRisksByAssignedTo(
            @PathVariable Long userId) {

        List<RiskResponseDTO> response =
                riskService.getRisksByAssignedTo(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Assigned risks retrieved successfully",
                        response));
    }

    // =========================================================
    // GET RISKS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getRisksByStatus(
            @PathVariable RiskStatus status) {

        List<RiskResponseDTO> response =
                riskService.getRisksByStatus(status);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risks retrieved successfully",
                        response));
    }

    // =========================================================
    // GET RISKS BY LEVEL
    // =========================================================

    @GetMapping("/level/{level}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getRisksByLevel(
            @PathVariable RiskLevel level) {

        List<RiskResponseDTO> response =
                riskService.getRisksByLevel(level);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risks retrieved successfully",
                        response));
    }

    // =========================================================
    // GET RISKS BY DEPARTMENT
    // =========================================================

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getRisksByDepartment(
            @PathVariable Department department) {

        List<RiskResponseDTO> response =
                riskService.getRisksByDepartment(department);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risks retrieved successfully",
                        response));
    }

    // =========================================================
    // SEARCH RISKS
    // =========================================================

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('RISK_SEARCH')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    searchRisks(
            @RequestParam String title) {

        List<RiskResponseDTO> response =
                riskService.searchRisks(title);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Search completed successfully",
                        response));
    }

    // =========================================================
    // DELETE RISK
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RISK_DELETE')")
    public ResponseEntity<ApiResponse<String>> deleteRisk(
            @PathVariable Long id) {

        riskService.deleteRisk(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risk deleted successfully",
                        "Deleted"));
    }

    // =========================================================
    // GET RISKS BY CATEGORY
    // =========================================================

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getRisksByCategory(
            @PathVariable RiskCategory category) {

        List<RiskResponseDTO> response =
                riskService.getRisksByCategory(category);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risks retrieved successfully",
                        response));
    }

    // =========================================================
    // ASSIGN RISK TO USER
    // =========================================================

    @PatchMapping("/{riskId}/assign/{userId}")
    @PreAuthorize("hasAuthority('RISK_ASSIGN')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>> assignRisk(
            @PathVariable Long riskId,
            @PathVariable Long userId) {

        RiskResponseDTO response =
                riskService.assignRisk(riskId, userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risk assigned successfully",
                        response));
    }

    // =========================================================
    // UPDATE RISK STATUS
    // =========================================================

    @PatchMapping("/{riskId}/status")
    @PreAuthorize("hasAuthority('RISK_STATUS_UPDATE')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>>
    updateRiskStatus(
            @PathVariable Long riskId,
            @RequestParam RiskStatus status) {

        RiskResponseDTO response =
                riskService.updateRiskStatus(
                        riskId,
                        status);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Risk status updated successfully",
                        response));
    }

    // =========================================================
    // UPDATE MITIGATION
    // =========================================================

    @PatchMapping("/{riskId}/mitigation")
    @PreAuthorize("hasAuthority('RISK_MITIGATION_UPDATE')")
    public ResponseEntity<ApiResponse<RiskResponseDTO>>
    updateMitigation(
            @PathVariable Long riskId,
            @RequestParam String mitigationUpdate) {

        RiskResponseDTO response =
                riskService.updateMitigation(
                        riskId,
                        mitigationUpdate);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Mitigation updated successfully",
                        response));
    }

    // =========================================================
    // DASHBOARD - TOTAL RISKS
    // =========================================================

    @GetMapping("/dashboard/total")
    @PreAuthorize("hasAuthority('RISK_DASHBOARD_VIEW')")
    public ResponseEntity<ApiResponse<Long>> getTotalRisks() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Total risks retrieved successfully",
                        riskService.getTotalRisks()));
    }

    // =========================================================
    // DASHBOARD - OPEN RISKS
    // =========================================================

    @GetMapping("/dashboard/open")
    @PreAuthorize("hasAuthority('RISK_DASHBOARD_VIEW')")
    public ResponseEntity<ApiResponse<Long>> getOpenRisks() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Open risks retrieved successfully",
                        riskService.getOpenRisks()));
    }

    // =========================================================
    // DASHBOARD - CLOSED RISKS
    // =========================================================

    @GetMapping("/dashboard/closed")
    @PreAuthorize("hasAuthority('RISK_DASHBOARD_VIEW')")
    public ResponseEntity<ApiResponse<Long>> getClosedRisks() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Closed risks retrieved successfully",
                        riskService.getClosedRisks()));
    }

    // =========================================================
    // DASHBOARD - HIGH RISKS
    // =========================================================

    @GetMapping("/dashboard/high")
    @PreAuthorize("hasAuthority('RISK_DASHBOARD_VIEW')")
    public ResponseEntity<ApiResponse<Long>> getHighRiskCount() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "High risk count retrieved successfully",
                        riskService.getHighRiskCount()));
    }

    // =========================================================
    // DASHBOARD - CRITICAL RISKS
    // =========================================================

    @GetMapping("/dashboard/critical")
    @PreAuthorize("hasAuthority('RISK_DASHBOARD_VIEW')")
    public ResponseEntity<ApiResponse<Long>> getCriticalRiskCount() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Critical risk count retrieved successfully",
                        riskService.getCriticalRiskCount()));
    }

    // =========================================================
    // GET OVERDUE RISKS
    // =========================================================

    @GetMapping("/overdue")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getOverdueRisks() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Overdue risks retrieved successfully",
                        riskService.getOverdueRisks()));
    }

    // =========================================================
    // GET CLOSED RISK LIST
    // =========================================================

    @GetMapping("/closed")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<RiskResponseDTO>>>
    getClosedRiskList() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Closed risks retrieved successfully",
                        riskService.getClosedRiskList()));
    }

    // =========================================================
    // GET RISKS FOR LOGGED-IN AUDIT MANAGER
    // =========================================================

    @GetMapping("/manager/my-risks")
    @PreAuthorize("hasAuthority('RISK_VIEW')")
    public ResponseEntity<ApiResponse<List<Risk>>>
    getRisksForManager() {

        List<Risk> response =
                riskService.getRisksForManager();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Department risks retrieved successfully",
                        response));
    }

    // =========================================================
    // GET INTERNAL AUDITORS FOR LOGGED-IN AUDIT MANAGER
    // =========================================================

    @GetMapping("/manager/internal-auditors")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<ApiResponse<List<User>>>
    getInternalAuditorsForManager() {

        List<User> response =
                riskService.getInternalAuditorsForManager();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Internal Auditors retrieved successfully",
                        response));
    }
}