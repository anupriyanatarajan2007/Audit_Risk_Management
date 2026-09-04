package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.dto.RegulatoryRequirementRequestDTO;
import com.example.audit_risk_management.dto.RegulatoryRequirementResponseDTO;
import com.example.audit_risk_management.service.RegulatoryRequirementService;

@RestController
@RequestMapping("/api/regulatory-requirements")
@CrossOrigin(origins = "*")
public class RegulatoryRequirementController {

    @Autowired
    private RegulatoryRequirementService service;


    // =========================================================
    // GET ALL REQUIREMENTS
    // Permission: REGULATORY_REQUIREMENT_VIEW
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW')")
    @GetMapping
    public ResponseEntity<List<RegulatoryRequirementResponseDTO>>
            getAllRequirements() {

        return ResponseEntity.ok(
                service.getAllRequirements()
        );
    }


    // =========================================================
    // GET REQUIREMENT BY ID
    // Permission: REGULATORY_REQUIREMENT_VIEW
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<RegulatoryRequirementResponseDTO>
            getRequirementById(@PathVariable Long id) {

        return ResponseEntity.ok(
                service.getRequirementById(id)
        );
    }


    // =========================================================
    // GET BY REQUIREMENT CODE
    // Permission: REGULATORY_REQUIREMENT_VIEW_BY_CODE
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW_BY_CODE')")
    @GetMapping("/code/{requirementCode}")
    public ResponseEntity<RegulatoryRequirementResponseDTO>
            getRequirementByCode(
                    @PathVariable String requirementCode) {

        return ResponseEntity.ok(
                service.getRequirementByCode(
                        requirementCode
                )
        );
    }


    // =========================================================
    // GET BY STATUS
    // Permission: REGULATORY_REQUIREMENT_VIEW_BY_STATUS
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW_BY_STATUS')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RegulatoryRequirementResponseDTO>>
            getByStatus(@PathVariable String status) {

        return ResponseEntity.ok(
                service.getRequirementsByStatus(status)
        );
    }


    // =========================================================
    // GET BY CATEGORY
    // Permission: REGULATORY_REQUIREMENT_VIEW_BY_CATEGORY
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW_BY_CATEGORY')")
    @GetMapping("/category/{category}")
    public ResponseEntity<List<RegulatoryRequirementResponseDTO>>
            getByCategory(@PathVariable String category) {

        return ResponseEntity.ok(
                service.getRequirementsByCategory(category)
        );
    }


    // =========================================================
    // GET BY REGULATORY BODY
    // Permission: REGULATORY_REQUIREMENT_VIEW_BY_REGULATORY_BODY
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW_BY_REGULATORY_BODY')")
    @GetMapping("/regulatory-body/{regulatoryBody}")
    public ResponseEntity<List<RegulatoryRequirementResponseDTO>>
            getByRegulatoryBody(
                    @PathVariable String regulatoryBody) {

        return ResponseEntity.ok(
                service.getRequirementsByRegulatoryBody(
                        regulatoryBody
                )
        );
    }


    // =========================================================
    // GET BY DEPARTMENT
    // Permission: REGULATORY_REQUIREMENT_VIEW_BY_DEPARTMENT
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_VIEW_BY_DEPARTMENT')")
    @GetMapping("/department/{department}")
    public ResponseEntity<List<RegulatoryRequirementResponseDTO>>
            getByDepartment(
                    @PathVariable String department) {

        return ResponseEntity.ok(
                service.getRequirementsByDepartment(
                        department
                )
        );
    }


    // =========================================================
    // CREATE REQUIREMENT
    // Permission: REGULATORY_REQUIREMENT_CREATE
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_CREATE')")
    @PostMapping
    public ResponseEntity<RegulatoryRequirementResponseDTO> createRequirement(
            @RequestBody RegulatoryRequirementRequestDTO request) {

        return ResponseEntity.ok(
                service.createRequirement(request)
        );
    }


    // =========================================================
    // UPDATE REQUIREMENT
    // Permission: REGULATORY_REQUIREMENT_UPDATE
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<RegulatoryRequirementResponseDTO> updateRequirement(
            @PathVariable Long id,
            @RequestBody RegulatoryRequirementRequestDTO request) {

        return ResponseEntity.ok(
                service.updateRequirement(id, request)
        );
    }


    // =========================================================
    // DELETE REQUIREMENT
    // Permission: REGULATORY_REQUIREMENT_DELETE
    // =========================================================

    @PreAuthorize("hasAuthority('REGULATORY_REQUIREMENT_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequirement(
            @PathVariable Long id) {

        service.deleteRequirement(id);

        return ResponseEntity.noContent().build();
    }
}