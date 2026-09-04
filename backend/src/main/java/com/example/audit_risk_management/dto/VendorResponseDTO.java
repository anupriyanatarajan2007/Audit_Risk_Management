package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.VendorRiskLevel;
import com.example.audit_risk_management.enums.VendorStatus;

public class VendorResponseDTO {

    private String vendorId;

    private String vendorName;

    private String contactPerson;

    private String email;

    private String phoneNumber;

    private String address;

    private String serviceProvided;

    private LocalDate contractStartDate;

    private LocalDate contractEndDate;

    private VendorStatus vendorStatus;

    private VendorRiskLevel riskLevel;

    private String remarks;

    private Long createdById;

    private String createdByName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public VendorResponseDTO() {
    }

    public String getVendorId() {
        return vendorId;
    }

    public void setVendorId(String vendorId) {
        this.vendorId = vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getServiceProvided() {
        return serviceProvided;
    }

    public void setServiceProvided(String serviceProvided) {
        this.serviceProvided = serviceProvided;
    }

    public LocalDate getContractStartDate() {
        return contractStartDate;
    }

    public void setContractStartDate(LocalDate contractStartDate) {
        this.contractStartDate = contractStartDate;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public VendorStatus getVendorStatus() {
        return vendorStatus;
    }

    public void setVendorStatus(VendorStatus vendorStatus) {
        this.vendorStatus = vendorStatus;
    }

    public VendorRiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(VendorRiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}