package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.RiskRequestDTO;
import com.example.audit_risk_management.dto.RiskResponseDTO;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.enums.RiskStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;

public interface RiskService {

    // =========================================================
    // CRUD OPERATIONS
    // =========================================================

    RiskResponseDTO createRisk(RiskRequestDTO requestDTO);

    RiskResponseDTO updateRisk(
            Long id,
            RiskRequestDTO requestDTO);

    RiskResponseDTO getRiskById(Long id);

    RiskResponseDTO getRiskByRiskId(String riskId);

    List<RiskResponseDTO> getAllRisks();

    void deleteRisk(Long id);


    // =========================================================
    // USER
    // =========================================================

    List<RiskResponseDTO> getRisksByIdentifiedBy(
            Long userId);

    List<RiskResponseDTO> getRisksByAssignedTo(
            Long userId);


    // =========================================================
    // FILTERS
    // =========================================================

    List<RiskResponseDTO> getRisksByStatus(
            RiskStatus status);

    List<RiskResponseDTO> getRisksByLevel(
            RiskLevel level);

    List<RiskResponseDTO> getRisksByDepartment(
            Department department);

    List<RiskResponseDTO> getRisksByCategory(
            RiskCategory category);


    // =========================================================
    // SEARCH
    // =========================================================

    List<RiskResponseDTO> searchRisks(
            String title);


    // =========================================================
    // DASHBOARD
    // =========================================================

    Long getTotalRisks();

    Long getOpenRisks();

    Long getClosedRisks();

    Long getHighRiskCount();

    Long getCriticalRiskCount();


    // =========================================================
    // WORKFLOW
    // =========================================================

    RiskResponseDTO assignRisk(
            Long riskId,
            Long userId);

    RiskResponseDTO updateRiskStatus(
            Long riskId,
            RiskStatus status);

    RiskResponseDTO updateMitigation(
            Long riskId,
            String mitigationUpdate);


    // =========================================================
    // REPORTS
    // =========================================================

    List<RiskResponseDTO> getOverdueRisks();

    List<RiskResponseDTO> getClosedRiskList();


    // =========================================================
    // AUDIT MANAGER
    // =========================================================

    List<Risk> getRisksForManager();

    List<User> getInternalAuditorsForManager();
}
