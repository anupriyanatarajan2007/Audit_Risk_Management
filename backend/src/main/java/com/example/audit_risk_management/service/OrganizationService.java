package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.OrganizationRequestDTO;
import com.example.audit_risk_management.dto.OrganizationResponseDTO;

public interface OrganizationService {

    OrganizationResponseDTO createOrganization(
            OrganizationRequestDTO requestDTO);

    OrganizationResponseDTO getOrganizationById(Long id);

    List<OrganizationResponseDTO> getAllOrganizations();

    List<OrganizationResponseDTO> getOrganizationsByStatus(
            Boolean active);

    OrganizationResponseDTO updateOrganization(
            Long id,
            OrganizationRequestDTO requestDTO);

    void deleteOrganization(Long id);

    OrganizationResponseDTO activateOrganization(Long id);

    OrganizationResponseDTO deactivateOrganization(Long id);
}