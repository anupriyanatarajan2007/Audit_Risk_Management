package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.audit_risk_management.model.Recommendation;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByInternalAuditorId(Long internalAuditorId);

    List<Recommendation> findByAuditeeId(Long auditeeId);

    List<Recommendation> findByFindingId(Long findingId);
}