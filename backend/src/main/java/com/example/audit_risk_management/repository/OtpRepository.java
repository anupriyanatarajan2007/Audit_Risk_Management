package com.example.audit_risk_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.OTP;

import jakarta.transaction.Transactional;

@Repository
public interface OtpRepository
        extends JpaRepository<OTP, Long>{

    Optional<OTP> findByEmail(String email);

    @Transactional
    @Modifying
    void deleteByEmail(String email);
}