package com.example.audit_risk_management.serviceImpl;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.enums.EvidenceStatus;
import com.example.audit_risk_management.model.Evidence;
import com.example.audit_risk_management.repository.EvidenceRepository;
import com.example.audit_risk_management.service.ComplianceService;


@Service
public class ComplianceServiceImpl implements ComplianceService {


    @Autowired
    private EvidenceRepository evidenceRepository;



    @Override
    public List<Evidence> getComplianceReviews() {

        return evidenceRepository.findAll();

    }
    @Override
    public Evidence updateEvidenceStatus(
            Long evidenceId,
            String status) {


        Evidence evidence =
                evidenceRepository.findById(evidenceId)
                .orElseThrow(
                    () -> new RuntimeException("Evidence not found")
                );


        evidence.setStatus(
            EvidenceStatus.valueOf(status)
        );


        return evidenceRepository.save(evidence);

    }


}