package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.RegulatoryRequirementResponseDTO;
import com.example.audit_risk_management.dto.RegulatoryRequirementRequestDTO;

public interface RegulatoryRequirementService {

    // GET
    List<RegulatoryRequirementResponseDTO> getAllRequirements();

    RegulatoryRequirementResponseDTO getRequirementById(Long id);

    RegulatoryRequirementResponseDTO getRequirementByCode(
            String requirementCode
    );

    List<RegulatoryRequirementResponseDTO> getRequirementsByStatus(
            String status
    );

    List<RegulatoryRequirementResponseDTO> getRequirementsByCategory(
            String category
    );

    List<RegulatoryRequirementResponseDTO> getRequirementsByRegulatoryBody(
            String regulatoryBody
    );

    List<RegulatoryRequirementResponseDTO> getRequirementsByDepartment(
            String department
    );

    // POST
    RegulatoryRequirementResponseDTO createRequirement(
            RegulatoryRequirementRequestDTO request
    );

    // PUT
    RegulatoryRequirementResponseDTO updateRequirement(
            Long id,
            RegulatoryRequirementRequestDTO request
    );

    // DELETE
    void deleteRequirement(Long id);
}