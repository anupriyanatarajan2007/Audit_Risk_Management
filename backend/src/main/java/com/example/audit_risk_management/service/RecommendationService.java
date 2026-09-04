package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.RecommendationRequestDTO;
import com.example.audit_risk_management.dto.RecommendationResponseDTO;

public interface RecommendationService {


    // Internal Auditor creates recommendation
    RecommendationResponseDTO createRecommendation(
            RecommendationRequestDTO dto
    );


    // Get recommendation
    RecommendationResponseDTO getRecommendationById(
            Long id
    );


    // Internal Auditor's recommendations
    List<RecommendationResponseDTO>
    getRecommendationsForCurrentAuditor();


    // Auditee's recommendations
    List<RecommendationResponseDTO>
    getRecommendationsForCurrentAuditee();


    // Recommendations for one finding
    List<RecommendationResponseDTO>
    getRecommendationsForFinding(Long findingId);


    // Update status
    RecommendationResponseDTO updateStatus(
            Long id,
            String status
    );

    List<RecommendationResponseDTO> getAllRecommendations();
}