package com.example.audit_risk_management.dto;

public class OrganizationResponseDTO {

    private Long id;
    private String organizationName;
    private String organizationCode;
    private String industry;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private boolean active;

    public OrganizationResponseDTO() {
    }

    public OrganizationResponseDTO(
            Long id,
            String organizationName,
            String organizationCode,
            String industry,
            String address,
            String contactEmail,
            String contactPhone,
            boolean active
    ) {
        this.id = id;
        this.organizationName = organizationName;
        this.organizationCode = organizationCode;
        this.industry = industry;
        this.address = address;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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