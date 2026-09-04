package com.example.audit_risk_management.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeId;

    @Column(unique = true)
    private String email;

    private String password;


    // =====================================================
    // LOGIN SECURITY
    // =====================================================

    @Column(nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column
    private LocalDateTime passwordChangedAt;


    // =====================================================
    // ROLE
    // =====================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    @JsonIgnoreProperties("permissions")
    private Role role;


    // =====================================================
    // ENABLED
    // =====================================================

    @Column(
        nullable = false,
        columnDefinition = "boolean default true"
    )
    private boolean enabled = true;


    // =====================================================
    // DATE/TIME
    // =====================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // =====================================================
    // DEPARTMENT
    // =====================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties("users")
    private Department department;


    // =====================================================
    // PROFILE
    // =====================================================

    @OneToOne(
        mappedBy = "user",
        cascade = CascadeType.ALL,
        fetch = FetchType.EAGER
    )
    @JsonIgnoreProperties("user")
    private Profile profile;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public User() {
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }

    public Role getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Department getDepartment() {
        return department;
    }

    public Profile getProfile() {
        return profile;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }
}