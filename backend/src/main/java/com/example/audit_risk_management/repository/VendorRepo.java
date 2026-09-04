package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.VendorRiskLevel;
import com.example.audit_risk_management.enums.VendorStatus;
import com.example.audit_risk_management.model.Vendor;

@Repository
public interface VendorRepo extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByVendorId(String vendorId);

    boolean existsByVendorId(String vendorId);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    void deleteByVendorId(String vendorId);

    List<Vendor> findByVendorStatus(VendorStatus vendorStatus);

    List<Vendor> findByRiskLevel(VendorRiskLevel riskLevel);

    List<Vendor> findByCreatedBy_Id(Long createdById);

}