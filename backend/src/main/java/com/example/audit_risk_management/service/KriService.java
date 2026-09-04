package com.example.audit_risk_management.service;

import java.util.List;
import java.util.Map;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.KriRequestDTO;
import com.example.audit_risk_management.dto.KriResponseDTO;
import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.model.Department;

public interface KriService {


    // ================= CREATE KRI =================

    ApiResponse<KriResponseDTO> createKri(
            KriRequestDTO request);



    // ================= GET ALL KRIs =================

    ApiResponse<List<KriResponseDTO>> getAllKris();



    // ================= GET KRI BY ID =================

    ApiResponse<KriResponseDTO> getKriById(
            Long id);



    // ================= UPDATE KRI =================

    ApiResponse<KriResponseDTO> updateKri(
            Long id,
            KriRequestDTO request);



    // ================= DELETE KRI =================

    ApiResponse<Void> deleteKri(
            Long id);



    // ================= GET BY RISK =================

    ApiResponse<List<KriResponseDTO>> getKrisByRisk(
            Long riskId);



    // ================= GET BY STATUS =================

    ApiResponse<List<KriResponseDTO>> getKrisByStatus(
            KriStatus status);



    // ================= UPDATE STATUS =================

    ApiResponse<KriResponseDTO> updateStatus(
            Long id,
            KriStatus status);



    // ================= GET BY DEPARTMENT =================

    ApiResponse<List<KriResponseDTO>> getKrisByDepartment(
            Department department);



    // ================= GET BY CATEGORY =================

    ApiResponse<List<KriResponseDTO>> getKrisByRiskCategory(
            RiskCategory riskCategory);



    // ================= GET BY OWNER =================

    ApiResponse<List<KriResponseDTO>> getKrisByOwner(
            Long ownerId);



    // ================= SEARCH =================

    ApiResponse<List<KriResponseDTO>> searchKri(
            String keyword);



    // ================= CRITICAL KRIs =================

    ApiResponse<List<KriResponseDTO>> getCriticalKris();



    // ================= DASHBOARD =================

    ApiResponse<Map<String, Long>> getDashboard();

}