package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.model.Evidence;

public interface ComplianceService {


    List<Evidence> getComplianceReviews();


    Evidence updateEvidenceStatus(
            Long evidenceId,
            String status
    );


}