package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.RiskAuditorAssignmentRequest;
import com.example.audit_risk_management.dto.RiskAuditorAssignmentResponse;
import com.example.audit_risk_management.enums.AssignmentPriority;
import com.example.audit_risk_management.enums.AssignmentStatus;

public interface RiskAuditorAssignmentService {

    // Create
    RiskAuditorAssignmentResponse createAssignment(
            RiskAuditorAssignmentRequest request
    );

    // Get all
    List<RiskAuditorAssignmentResponse> getAllAssignments();

    // Get by ID
    RiskAuditorAssignmentResponse getAssignmentById(
            Long id
    );

    // Get by Risk ID
    List<RiskAuditorAssignmentResponse> getAssignmentsByRiskId(
            String riskId
    );

    // Get by Auditor Employee ID
    List<RiskAuditorAssignmentResponse> getAssignmentsByAuditor(
            String employeeId
    );

    // Get by Status
    List<RiskAuditorAssignmentResponse> getAssignmentsByStatus(
            AssignmentStatus status
    );

    // Get by Auditor + Status
    List<RiskAuditorAssignmentResponse> getAssignmentsByAuditorAndStatus(
            String employeeId,
            AssignmentStatus status
    );

    // Get by Assigned By
    List<RiskAuditorAssignmentResponse> getAssignmentsByAssignedBy(
            String employeeId
    );

    // Update Status
    RiskAuditorAssignmentResponse updateStatus(
            Long id,
            AssignmentStatus status
    );

    // Update Priority
    RiskAuditorAssignmentResponse updatePriority(
            Long id,
            AssignmentPriority priority
    );

    // Delete
    void deleteAssignment(Long id);
}