package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.VendorRequestDTO;
import com.example.audit_risk_management.dto.VendorResponseDTO;

public interface VendorService {

    ApiResponse<VendorResponseDTO> createVendor(VendorRequestDTO request);

    ApiResponse<VendorResponseDTO> getVendorById(String vendorId);

    ApiResponse<List<VendorResponseDTO>> getAllVendors();

    ApiResponse<List<VendorResponseDTO>> getVendorsByStatus(String status);

    ApiResponse<List<VendorResponseDTO>> getVendorsByRiskLevel(String riskLevel);

    ApiResponse<List<VendorResponseDTO>> getMyVendors();

    ApiResponse<VendorResponseDTO> updateVendor(String vendorId,
                                                VendorRequestDTO request);

    ApiResponse<String> deleteVendor(String vendorId);

}