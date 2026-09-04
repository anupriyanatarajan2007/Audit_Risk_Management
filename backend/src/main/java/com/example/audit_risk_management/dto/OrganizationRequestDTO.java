package com.example.audit_risk_management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class OrganizationRequestDTO {

    @NotBlank(message = "Organization name is required")
    @Size(max = 100)
    private String organizationName;

    @NotBlank(message = "Organization code is required")
    @Size(max = 50)
    private String organizationCode;

    @NotBlank(message = "Industry is required")
    @Size(max = 100)
    private String industry;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String address;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "Contact phone must contain exactly 10 digits"
    )
    private String contactPhone;

    private boolean active = true;

    public OrganizationRequestDTO() {
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationCode() {
        return organizationCode;
    }

    public void setOrganizationCode(String organizationCode) {
        this.organizationCode = organizationCode;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}