package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.RecommendationRequestDTO;
import com.example.audit_risk_management.dto.RecommendationResponseDTO;
import com.example.audit_risk_management.service.RecommendationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }


    // ============================================================
    // CREATE RECOMMENDATION
    // Permission: RECOMMENDATION_CREATE
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_CREATE')")
    @PostMapping
    public ResponseEntity<ApiResponse<RecommendationResponseDTO>> createRecommendation(
            @Valid @RequestBody RecommendationRequestDTO requestDTO) {

        RecommendationResponseDTO response =
                recommendationService.createRecommendation(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Recommendation created successfully",
                                response
                        )
                );
    }


    // ============================================================
    // GET RECOMMENDATION BY ID
    // Permission: RECOMMENDATION_VIEW
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecommendationResponseDTO>> getRecommendationById(
            @PathVariable Long id) {

        RecommendationResponseDTO response =
                recommendationService.getRecommendationById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Recommendation retrieved successfully",
                        response
                )
        );
    }


    // ============================================================
    // GET RECOMMENDATIONS FOR CURRENT INTERNAL AUDITOR
    // Permission: RECOMMENDATION_VIEW_MY_AUDITOR
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_VIEW_MY_AUDITOR')")
    @GetMapping("/my-recommendations")
    public ResponseEntity<ApiResponse<List<RecommendationResponseDTO>>>
    getRecommendationsForCurrentAuditor() {

        List<RecommendationResponseDTO> responses =
                recommendationService.getRecommendationsForCurrentAuditor();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Recommendations retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // GET RECOMMENDATIONS FOR CURRENT AUDITEE
    // Permission: RECOMMENDATION_VIEW_MY_AUDITEE
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_VIEW_MY_AUDITEE')")
    @GetMapping("/my-auditee-recommendations")
    public ResponseEntity<ApiResponse<List<RecommendationResponseDTO>>>
    getRecommendationsForCurrentAuditee() {

        List<RecommendationResponseDTO> responses =
                recommendationService.getRecommendationsForCurrentAuditee();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Recommendations retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // GET RECOMMENDATIONS FOR A FINDING
    // Permission: RECOMMENDATION_VIEW_BY_FINDING
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_VIEW_BY_FINDING')")
    @GetMapping("/finding/{findingId}")
    public ResponseEntity<ApiResponse<List<RecommendationResponseDTO>>>
    getRecommendationsForFinding(
            @PathVariable Long findingId) {

        List<RecommendationResponseDTO> responses =
                recommendationService.getRecommendationsForFinding(findingId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Recommendations for finding retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // GET ALL RECOMMENDATIONS
    // Permission: RECOMMENDATION_VIEW_ALL
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_VIEW_ALL')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<RecommendationResponseDTO>>>
    getAllRecommendations() {

        List<RecommendationResponseDTO> responses =
                recommendationService.getAllRecommendations();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "All recommendations retrieved successfully",
                        responses
                )
        );
    }


    // ============================================================
    // UPDATE STATUS
    // Permission: RECOMMENDATION_UPDATE_STATUS
    // ============================================================

    @PreAuthorize("hasAuthority('RECOMMENDATION_UPDATE_STATUS')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RecommendationResponseDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        RecommendationResponseDTO response =
                recommendationService.updateStatus(id, status);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Recommendation status updated successfully",
                        response
                )
        );
    }
}