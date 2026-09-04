package com.example.audit_risk_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.VerificationToken;


@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long>{
    VerificationTokenRepository findByToken(String token);
}
