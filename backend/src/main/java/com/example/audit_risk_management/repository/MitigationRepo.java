package com.example.audit_risk_management.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.enums.MitigationStatus;
import com.example.audit_risk_management.model.Mitigation;

@Repository
public interface MitigationRepo extends JpaRepository<Mitigation, Long> {

    Optional<Mitigation> findByMitigationId(String mitigationId);

    boolean existsByRiskId(Long riskId);

    boolean existsByMitigationId(String mitigationId);

    void deleteByMitigationId(String mitigationId);

    // Get all mitigations for a particular Risk
    List<Mitigation> findByRisk_Id(Long riskId);

    // Get all mitigations assigned to a User
    List<Mitigation> findByOwner_Id(Long ownerId);

    // Get mitigations by status
    List<Mitigation> findByStatus(com.example.audit_risk_management.enums.MitigationStatus status);

     // ===============================
    // Dashboard - Count By Status
    // ===============================
    long countByStatus(MitigationStatus status);

     List<Mitigation> findByTargetDateBeforeAndStatusNot(
            LocalDate date,
            MitigationStatus status
    );



    // ===============================
    // Search Mitigation
    // ===============================
    List<Mitigation> findByMitigationTitleContainingIgnoreCase(
            String keyword
    );

}