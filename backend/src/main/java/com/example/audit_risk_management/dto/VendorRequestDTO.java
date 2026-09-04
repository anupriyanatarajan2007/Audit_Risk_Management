package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import com.example.audit_risk_management.enums.VendorRiskLevel;
import com.example.audit_risk_management.enums.VendorStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class VendorRequestDTO {

    @NotBlank(message = "Vendor name is required")
    @Size(max = 100)
    private String vendorName;

    @NotBlank(message = "Contact person is required")
    @Size(max = 100)
    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String address;

    @NotBlank(message = "Service provided is required")
    @Size(max = 255)
    private String serviceProvided;

    @NotNull(message = "Contract start date is required")
    private LocalDate contractStartDate;

    @NotNull(message = "Contract end date is required")
    private LocalDate contractEndDate;

    @NotNull(message = "Vendor status is required")
    private VendorStatus vendorStatus;

    @NotNull(message = "Risk level is required")
    private VendorRiskLevel riskLevel;

    @Size(max = 500)
    private String remarks;

    public VendorRequestDTO() {
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
}