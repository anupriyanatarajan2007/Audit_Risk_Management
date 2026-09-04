package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.VendorRequestDTO;
import com.example.audit_risk_management.dto.VendorResponseDTO;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.model.Vendor;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.repository.VendorRepo;
import com.example.audit_risk_management.service.VendorService;

@Service
public class VendorServiceImpl implements VendorService {

    @Autowired
    private VendorRepo vendorRepo;

    @Autowired
    private UserRepo userRepo;

    // ====================== CREATE VENDOR ======================

    @Override
    public ApiResponse<VendorResponseDTO> createVendor(VendorRequestDTO request) {

        if (vendorRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Vendor email already exists");
        }

        if (vendorRepo.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Vendor phone number already exists");
        }

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = new Vendor();

        vendor.setVendorId(generateVendorId());
        vendor.setVendorName(request.getVendorName());
        vendor.setContactPerson(request.getContactPerson());
        vendor.setEmail(request.getEmail());
        vendor.setPhoneNumber(request.getPhoneNumber());
        vendor.setAddress(request.getAddress());
        vendor.setServiceProvided(request.getServiceProvided());
        vendor.setContractStartDate(request.getContractStartDate());
        vendor.setContractEndDate(request.getContractEndDate());
        vendor.setVendorStatus(request.getVendorStatus());
        vendor.setRiskLevel(request.getRiskLevel());
        vendor.setRemarks(request.getRemarks());

        vendor.setCreatedBy(user);

        vendorRepo.save(vendor);

        return new ApiResponse<>(
                true,
                "Vendor created successfully",
                mapToResponse(vendor));
    }

    // ====================== GENERATE VENDOR ID ======================

    private String generateVendorId() {

        long count = vendorRepo.count() + 1;

        return String.format("VND-%03d", count);
    }

    // ====================== ENTITY -> DTO ======================

    private VendorResponseDTO mapToResponse(Vendor vendor) {

        VendorResponseDTO dto = new VendorResponseDTO();

        dto.setVendorId(vendor.getVendorId());
        dto.setVendorName(vendor.getVendorName());
        dto.setContactPerson(vendor.getContactPerson());
        dto.setEmail(vendor.getEmail());
        dto.setPhoneNumber(vendor.getPhoneNumber());
        dto.setAddress(vendor.getAddress());
        dto.setServiceProvided(vendor.getServiceProvided());

        dto.setContractStartDate(vendor.getContractStartDate());
        dto.setContractEndDate(vendor.getContractEndDate());

        dto.setVendorStatus(vendor.getVendorStatus());
        dto.setRiskLevel(vendor.getRiskLevel());

        dto.setRemarks(vendor.getRemarks());

        dto.setCreatedById(vendor.getCreatedBy().getId());

        dto.setCreatedByName(
                vendor.getCreatedBy().getProfile().getFirstName()
                        + " "
                        + vendor.getCreatedBy().getProfile().getLastName());

        dto.setCreatedAt(vendor.getCreatedAt());
        dto.setUpdatedAt(vendor.getUpdatedAt());

        return dto;
    }

    // ====================== GET ALL VENDORS ======================

@Override
public ApiResponse<List<VendorResponseDTO>> getAllVendors() {

    List<VendorResponseDTO> vendors = vendorRepo.findAll()
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "Vendors fetched successfully",
            vendors);
}

// ====================== GET VENDOR BY ID ======================

@Override
public ApiResponse<VendorResponseDTO> getVendorById(String vendorId) {

    Vendor vendor = vendorRepo.findByVendorId(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));

    return new ApiResponse<>(
            true,
            "Vendor fetched successfully",
            mapToResponse(vendor));
}

// ====================== GET VENDORS BY STATUS ======================

@Override
public ApiResponse<List<VendorResponseDTO>> getVendorsByStatus(String status) {

    List<VendorResponseDTO> vendors = vendorRepo
            .findByVendorStatus(
                    com.example.audit_risk_management.enums.VendorStatus.valueOf(status.toUpperCase()))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "Vendors fetched successfully",
            vendors);
}

// ====================== GET VENDORS BY RISK LEVEL ======================

@Override
public ApiResponse<List<VendorResponseDTO>> getVendorsByRiskLevel(String riskLevel) {

    List<VendorResponseDTO> vendors = vendorRepo
            .findByRiskLevel(
                    com.example.audit_risk_management.enums.VendorRiskLevel.valueOf(riskLevel.toUpperCase()))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "Vendors fetched successfully",
            vendors);
}

// ====================== GET MY VENDORS ======================

@Override
public ApiResponse<List<VendorResponseDTO>> getMyVendors() {

    Authentication authentication = SecurityContextHolder
            .getContext()
            .getAuthentication();

    String email = authentication.getName();

    User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    List<VendorResponseDTO> vendors = vendorRepo
            .findByCreatedBy_Id(user.getId())
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "My vendors fetched successfully",
            vendors);
}

// ====================== UPDATE VENDOR ======================

@Override
public ApiResponse<VendorResponseDTO> updateVendor(String vendorId,
        VendorRequestDTO request) {

    Vendor vendor = vendorRepo.findByVendorId(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));

    // Check duplicate email
    if (!vendor.getEmail().equals(request.getEmail())
            && vendorRepo.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Vendor email already exists");
    }

    // Check duplicate phone number
    if (!vendor.getPhoneNumber().equals(request.getPhoneNumber())
            && vendorRepo.existsByPhoneNumber(request.getPhoneNumber())) {
        throw new RuntimeException("Vendor phone number already exists");
    }

    vendor.setVendorName(request.getVendorName());
    vendor.setContactPerson(request.getContactPerson());
    vendor.setEmail(request.getEmail());
    vendor.setPhoneNumber(request.getPhoneNumber());
    vendor.setAddress(request.getAddress());
    vendor.setServiceProvided(request.getServiceProvided());
    vendor.setContractStartDate(request.getContractStartDate());
    vendor.setContractEndDate(request.getContractEndDate());
    vendor.setVendorStatus(request.getVendorStatus());
    vendor.setRiskLevel(request.getRiskLevel());
    vendor.setRemarks(request.getRemarks());

    vendorRepo.save(vendor);

    return new ApiResponse<>(
            true,
            "Vendor updated successfully",
            mapToResponse(vendor));
}

// ====================== DELETE VENDOR ======================

@Override
public ApiResponse<String> deleteVendor(String vendorId) {

    Vendor vendor = vendorRepo.findByVendorId(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));

    vendorRepo.delete(vendor);

    return new ApiResponse<>(
            true,
            "Vendor deleted successfully",
            vendorId);
}

}