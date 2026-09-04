package com.example.audit_risk_management.dto;

import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Role;

public class RegisterDto {

    private String email;
    private String password;

    private Role role;
    private Department department;

    private ProfileDto.ProfileRequestDTO profile;

    private String employeeId;

    // ADD THIS
    private boolean active = true;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RegisterDto() {
    }

    public RegisterDto(
            String email,
            String password,
            Role role,
            Department department,
            ProfileDto.ProfileRequestDTO profile,
            String employeeId) {

        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.profile = profile;
        this.employeeId = employeeId;
    }


    // =====================================================
    // EMAIL
    // =====================================================

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    // =====================================================
    // PASSWORD
    // =====================================================

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    // =====================================================
    // ROLE
    // =====================================================

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }


    // =====================================================
    // DEPARTMENT
    // =====================================================

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }


    // =====================================================
    // PROFILE
    // =====================================================

    public ProfileDto.ProfileRequestDTO getProfile() {
        return profile;
    }

    public void setProfile(ProfileDto.ProfileRequestDTO profile) {
        this.profile = profile;
    }


    // =====================================================
    // EMPLOYEE ID
    // =====================================================

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    // existing getters/setters...

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}