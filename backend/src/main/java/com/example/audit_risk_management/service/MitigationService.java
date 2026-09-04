package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.MitigationRequestDTO;
import com.example.audit_risk_management.dto.MitigationResponseDTO;
import com.example.audit_risk_management.enums.MitigationStatus;

public interface MitigationService {

    ApiResponse<MitigationResponseDTO> createMitigation(MitigationRequestDTO request);

    ApiResponse<MitigationResponseDTO> getMitigationById(String mitigationId);

    ApiResponse<List<MitigationResponseDTO>> getAllMitigations();

    ApiResponse<List<MitigationResponseDTO>> getMitigationsByRisk(Long riskId);

    ApiResponse<List<MitigationResponseDTO>> getMitigationsByOwner(Long ownerId);

    ApiResponse<MitigationResponseDTO> updateMitigation(String mitigationId,
            MitigationRequestDTO request);

    ApiResponse<String> deleteMitigation(String mitigationId);

    ApiResponse<MitigationResponseDTO> updateStatus(String mitigationId,MitigationStatus status);
    ApiResponse<MitigationResponseDTO> assignOwner(String mitigationId, Long ownerId);
     ApiResponse<MitigationResponseDTO> completeMitigation( String mitigationId);
     ApiResponse<List<MitigationResponseDTO>> getByStatus(
        MitigationStatus status);
        ApiResponse<List<MitigationResponseDTO>> getOverdueMitigations();
        ApiResponse<Long> getTotalMitigations();
        ApiResponse<Long> getCompletedCount();
        ApiResponse<Long> getPendingCount();
        ApiResponse<List<MitigationResponseDTO>> search(
            String keyword);
}