package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.AuditStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Table(name = "audits")
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String auditId;

    @Column(nullable = false)
    private String auditName;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_id", nullable = false)
    private Risk risk;

    @ManyToOne
@JoinColumn(name = "department_id")
private Department department;

    @Column(nullable = false)
    private String businessUnit;

    @Column(nullable = false)
    private String processName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditStatus status = AuditStatus.PLANNED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User internalAuditor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = AuditStatus.PLANNED;
        }

        if (auditId == null || auditId.isBlank()) {
            auditId = "AUD-" + System.currentTimeMillis();
        }
    }


    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    // ==========================
    // Getters
    // ==========================

    public Long getId() {
        return id;
    }

    public String getAuditId() {
        return auditId;
    }

    public String getAuditName() {
        return auditName;
    }

    public String getDescription() {
        return description;
    }

    public Risk getRisk() {
        return risk;
    }

    public Department getDepartment() {
        return department;
    }

    public String getBusinessUnit() {
        return businessUnit;
    }

    public String getProcessName() {
        return processName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public AuditStatus getStatus() {
        return status;
    }


    public User getInternalAuditor() {
        return internalAuditor;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // ==========================
    // Setters
    // ==========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setAuditId(String auditId) {
        this.auditId = auditId;
    }

    public void setAuditName(String auditName) {
        this.auditName = auditName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRisk(Risk risk) {
        this.risk = risk;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setBusinessUnit(String businessUnit) {
        this.businessUnit = businessUnit;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setStatus(AuditStatus status) {
        this.status = status;
    }



    public void setInternalAuditor(User internalAuditor) {
        this.internalAuditor = internalAuditor;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

}