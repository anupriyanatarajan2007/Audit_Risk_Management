
package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.AnnualAuditPlanRequestDTO;
import com.example.audit_risk_management.dto.AnnualAuditPlanResponseDTO;
import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;

public interface AnnualAuditPlanService {

    // =========================
    // Create Plan
    // =========================
    AnnualAuditPlanResponseDTO createPlan(
            AnnualAuditPlanRequestDTO requestDTO);


    // =========================
    // Update Plan
    // =========================
    AnnualAuditPlanResponseDTO updatePlan(
            Long id,
            AnnualAuditPlanRequestDTO requestDTO);


    // =========================
    // Get Plan By Database ID
    // =========================
    AnnualAuditPlanResponseDTO getPlanById(
            Long id);


    // =========================
    // Get Plan By Plan ID
    // Example: AAP-1754638290
    // =========================
    AnnualAuditPlanResponseDTO getPlanByPlanId(
            String planId);


    // =========================
    // Get All Plans
    // =========================
    List<AnnualAuditPlanResponseDTO> getAllPlans();


    // =========================
    // Get Plans Created By
    // Logged-in Audit Manager
    // =========================
    List<AnnualAuditPlanResponseDTO> getMyPlans();


    // =========================
    // Get Plans By Year
    // =========================
    List<AnnualAuditPlanResponseDTO> getPlansByYear(
            Integer year);


    // =========================
    // Get Plans By Status
    // =========================
    List<AnnualAuditPlanResponseDTO> getPlansByStatus(
            AnnualAuditPlanStatus status);


    // =========================
    // Delete Plan
    // =========================
    void deletePlan(
            Long id);


            AnnualAuditPlanResponseDTO updatePlanStatus(Long id, AnnualAuditPlanStatus status, String rejectionReason);
}

