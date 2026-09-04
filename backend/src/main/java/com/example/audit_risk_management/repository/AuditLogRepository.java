package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.AuditLog;
import com.example.audit_risk_management.model.User;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Get all logs - latest first
    List<AuditLog> findAllByOrderByTimestampDesc();

    // Get logs performed by a particular user
    List<AuditLog> findByUserOrderByTimestampDesc(User user);

    // Get logs for a particular module
    List<AuditLog> findByModuleOrderByTimestampDesc(String module);

    // Get logs for a particular action
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
}