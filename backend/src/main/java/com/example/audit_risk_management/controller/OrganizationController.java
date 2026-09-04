package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.OrganizationRequestDTO;
import com.example.audit_risk_management.dto.OrganizationResponseDTO;
import com.example.audit_risk_management.service.OrganizationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    // CREATE ORGANIZATION
    @PreAuthorize("hasAuthority('ORGANIZATION_CREATE')")
    @PostMapping
    public ResponseEntity<OrganizationResponseDTO> createOrganization(
            @Valid @RequestBody OrganizationRequestDTO requestDTO) {

        OrganizationResponseDTO response =
                organizationService.createOrganization(requestDTO);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET ORGANIZATION BY ID
    @PreAuthorize("hasAuthority('ORGANIZATION_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponseDTO> getOrganizationById(
            @PathVariable Long id) {

        OrganizationResponseDTO response =
                organizationService.getOrganizationById(id);

        return ResponseEntity.ok(response);
    }

    // GET ALL ORGANIZATIONS
    @PreAuthorize("hasAuthority('ORGANIZATION_VIEW')")
    @GetMapping
    public ResponseEntity<List<OrganizationResponseDTO>> getAllOrganizations() {

        List<OrganizationResponseDTO> organizations =
                organizationService.getAllOrganizations();

        return ResponseEntity.ok(organizations);
    }

    @PreAuthorize("hasAuthority('ORGANIZATION_VIEW')")
    @GetMapping("/status")
    public ResponseEntity<List<OrganizationResponseDTO>> getOrganizationsByStatus(
            @RequestParam Boolean active) {

        List<OrganizationResponseDTO> organizations =
                organizationService.getOrganizationsByStatus(active);

        return ResponseEntity.ok(organizations);
    }

    // UPDATE ORGANIZATION
    @PreAuthorize("hasAuthority('ORGANIZATION_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponseDTO> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationRequestDTO requestDTO) {

        OrganizationResponseDTO response =
                organizationService.updateOrganization(id, requestDTO);

        return ResponseEntity.ok(response);
    }

    // DELETE ORGANIZATION
    @PreAuthorize("hasAuthority('ORGANIZATION_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(
            @PathVariable Long id) {

        organizationService.deleteOrganization(id);

        return ResponseEntity.noContent().build();
    }

    // ACTIVATE ORGANIZATION
    @PreAuthorize("hasAuthority('ORGANIZATION_ACTIVATE')")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<OrganizationResponseDTO> activateOrganization(
            @PathVariable Long id) {

        OrganizationResponseDTO response =
                organizationService.activateOrganization(id);

        return ResponseEntity.ok(response);
    }

    // DEACTIVATE ORGANIZATION
    @PreAuthorize("hasAuthority('ORGANIZATION_DEACTIVATE')")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<OrganizationResponseDTO> deactivateOrganization(
            @PathVariable Long id) {

        OrganizationResponseDTO response =
                organizationService.deactivateOrganization(id);

        return ResponseEntity.ok(response);
    }
}