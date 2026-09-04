package com.example.audit_risk_management.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.example.audit_risk_management.dto.AuthDto;
import com.example.audit_risk_management.dto.ProfileResponseDto;
import com.example.audit_risk_management.dto.RegisterDto;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.ForgotPasswordRequest;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;

public interface UserService {

    void register(RegisterDto registerDto);

    AuthDto.LoginResponse login(AuthDto.LoginRequest request);

    ResponseEntity<?> forgotPassword(
            ForgotPasswordRequest request
    );

    // ==========================================
    // Get users by Role entity
    // ==========================================
    List<User> getUsersByRole(Role role);

    // ==========================================
    // Get users by Role name
    // Example: INTERNAL_AUDITOR
    // ==========================================
    List<User> getUsersByRoleName(String roleName);

    // ==========================================
    // Get users by Department
    // ==========================================
    List<User> getUsersByDepartment(
            Department department
    );

    // ==========================================
    // Get users by Role and Department
    // ==========================================
    List<User> getUsersByRoleAndDepartment(
            Role role,
            Department department
    );

    // ==========================================
    // Get all users
    // ==========================================
    List<User> getAllUsers();

    // ==========================================
    // Update user
    // ==========================================
    void updateUser(
            Long id,
            RegisterDto registerDto
    );

    // ==========================================
    // Get profile
    // ==========================================
    ProfileResponseDto getProfile(
            String email
    );
}