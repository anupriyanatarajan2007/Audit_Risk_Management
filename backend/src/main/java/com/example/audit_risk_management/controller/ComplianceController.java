package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.model.Evidence;
import com.example.audit_risk_management.service.ComplianceService;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "*")
public class ComplianceController {

    @Autowired
    private ComplianceService complianceService;


    // =========================================================
    // GET ALL EVIDENCE FOR COMPLIANCE REVIEW
    // =========================================================

    @GetMapping("/reviews")
    public ResponseEntity<List<Evidence>> getReviews() {

        return ResponseEntity.ok(
                complianceService.getComplianceReviews()
        );
    }


    // =========================================================
    // APPROVE / REJECT EVIDENCE
    // =========================================================

    @PutMapping("/review/{id}/{status}")
    public ResponseEntity<Evidence> updateStatus(
            @PathVariable Long id,
            @PathVariable String status) {

        Evidence updated =
                complianceService.updateEvidenceStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(updated);
    }
}