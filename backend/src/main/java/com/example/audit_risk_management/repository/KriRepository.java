package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.model.Kri;
import com.example.audit_risk_management.model.Department;

@Repository
public interface KriRepository extends JpaRepository<Kri, Long> {


    // ===============================
    // Find By KRI ID
    // ===============================
    Optional<Kri> findByKriId(String kriId);

    // ===============================
    // Check KRI already exists for Risk
    // ===============================
    boolean existsByRisk_Id(Long riskId);

    // ===============================
    // Check Duplicate KRI ID
    // ===============================
    boolean existsByKriId(String kriId);



    // ===============================
    // Department Wise KRIs
    // ===============================
    List<Kri> findByDepartment(Department department);



    // ===============================
    // Status Wise KRIs
    // ===============================
    List<Kri> findByStatus(KriStatus status);



    // ===============================
    // Risk Category Wise KRIs
    // ===============================
    List<Kri> findByRiskCategory(RiskCategory riskCategory);



    // ===============================
    // Risk Wise KRIs
    // ===============================
    List<Kri> findByRisk_Id(Long riskId);



    // ===============================
    // Owner Wise KRIs
    // ===============================
    List<Kri> findByOwner_Id(Long ownerId);



    // ===============================
    // Dashboard Count By Status
    // ===============================
    long countByStatus(KriStatus status);



    // ===============================
    // Dashboard Count By Department
    // ===============================
    long countByDepartment(Department department);



    // ===============================
    // Dashboard Count By Risk Category
    // ===============================
    long countByRiskCategory(RiskCategory riskCategory);



    // ===============================
    // Search KRI By Name
    // ===============================
    List<Kri> findByKriNameContainingIgnoreCase(
            String keyword);



    // ===============================
    // Critical KRIs (RED)
    // ===============================
    List<Kri> findByStatusOrderByCreatedAtDesc(
            KriStatus status);



    // ===============================
    // Total KRI Count
    // ===============================
    long count();


}