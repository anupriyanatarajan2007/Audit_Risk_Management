package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.audit_risk_management.enums.RegulatoryStatus;
import com.example.audit_risk_management.model.RegulatoryRequirement;

public interface RegulatoryRequirementRepository
        extends JpaRepository<RegulatoryRequirement, Long> {

    Optional<RegulatoryRequirement> findByRequirementCode(
            String requirementCode
    );

    List<RegulatoryRequirement> findByStatus(
            RegulatoryStatus status
    );

    List<RegulatoryRequirement> findByCategory(
            String category
    );

    List<RegulatoryRequirement> findByRegulatoryBody(
            String regulatoryBody
    );

    List<RegulatoryRequirement> findByApplicableDepartment(
            String department
    );
}