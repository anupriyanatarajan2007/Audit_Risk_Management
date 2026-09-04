package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.VendorRequestDTO;
import com.example.audit_risk_management.dto.VendorResponseDTO;
import com.example.audit_risk_management.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "*")
public class VendorController {

    @Autowired
    private VendorService vendorService;


    // =========================================================
    // CREATE VENDOR
    // POST /api/vendors
    // Authority: VENDOR_CREATE
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('VENDOR_CREATE')")
    public ResponseEntity<ApiResponse<VendorResponseDTO>> createVendor(
            @Valid @RequestBody VendorRequestDTO request) {

        return ResponseEntity.ok(
                vendorService.createVendor(request)
        );
    }


    // =========================================================
    // GET ALL VENDORS
    // GET /api/vendors
    // Authority: VENDOR_READ
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('VENDOR_READ')")
    public ResponseEntity<ApiResponse<List<VendorResponseDTO>>> getAllVendors() {

        return ResponseEntity.ok(
                vendorService.getAllVendors()
        );
    }


    // =========================================================
    // GET VENDOR BY ID
    // GET /api/vendors/{vendorId}
    // Authority: VENDOR_READ
    // =========================================================

    @GetMapping("/{vendorId}")
    @PreAuthorize("hasAuthority('VENDOR_READ')")
    public ResponseEntity<ApiResponse<VendorResponseDTO>> getVendorById(
            @PathVariable String vendorId) {

        return ResponseEntity.ok(
                vendorService.getVendorById(vendorId)
        );
    }


    // =========================================================
    // GET VENDORS BY STATUS
    // GET /api/vendors/status/{status}
    // Authority: VENDOR_VIEW_BY_STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('VENDOR_VIEW_BY_STATUS')")
    public ResponseEntity<ApiResponse<List<VendorResponseDTO>>> getVendorsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                vendorService.getVendorsByStatus(status)
        );
    }


    // =========================================================
    // GET VENDORS BY RISK LEVEL
    // GET /api/vendors/risk-level/{riskLevel}
    // Authority: VENDOR_VIEW_BY_RISK_LEVEL
    // =========================================================

    @GetMapping("/risk-level/{riskLevel}")
    @PreAuthorize("hasAuthority('VENDOR_VIEW_BY_RISK_LEVEL')")
    public ResponseEntity<ApiResponse<List<VendorResponseDTO>>> getVendorsByRiskLevel(
            @PathVariable String riskLevel) {

        return ResponseEntity.ok(
                vendorService.getVendorsByRiskLevel(riskLevel)
        );
    }


    // =========================================================
    // GET MY VENDORS
    // GET /api/vendors/my-vendors
    // Authority: VENDOR_VIEW_MY_VENDORS
    // =========================================================

    @GetMapping("/my-vendors")
    @PreAuthorize("hasAuthority('VENDOR_VIEW_MY_VENDORS')")
    public ResponseEntity<ApiResponse<List<VendorResponseDTO>>> getMyVendors() {

        return ResponseEntity.ok(
                vendorService.getMyVendors()
        );
    }


    // =========================================================
    // UPDATE VENDOR
    // PUT /api/vendors/{vendorId}
    // Authority: VENDOR_UPDATE
    // =========================================================

    @PutMapping("/{vendorId}")
    @PreAuthorize("hasAuthority('VENDOR_UPDATE')")
    public ResponseEntity<ApiResponse<VendorResponseDTO>> updateVendor(
            @PathVariable String vendorId,
            @Valid @RequestBody VendorRequestDTO request) {

        return ResponseEntity.ok(
                vendorService.updateVendor(vendorId, request)
        );
    }


    // =========================================================
    // DELETE VENDOR
    // DELETE /api/vendors/{vendorId}
    // Authority: VENDOR_DELETE
    // =========================================================

    @DeleteMapping("/{vendorId}")
    @PreAuthorize("hasAuthority('VENDOR_DELETE')")
    public ResponseEntity<ApiResponse<String>> deleteVendor(
            @PathVariable String vendorId) {

        return ResponseEntity.ok(
                vendorService.deleteVendor(vendorId)
        );
    }
}
