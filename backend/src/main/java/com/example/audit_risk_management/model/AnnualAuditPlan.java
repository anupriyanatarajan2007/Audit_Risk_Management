package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "annual_audit_plans",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"plan_year", "department"}
        )
    }
)
public class AnnualAuditPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String planId;

    @Column(nullable = false)
    private Integer planYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false)
    private String planName;

    @Column(length = 2000)
    private String description;

    // =========================
    // Planned Dates
    // =========================

    @Column(nullable = false)
    private LocalDate plannedStartDate;

    @Column(nullable = false)
    private LocalDate plannedEndDate;

    // =========================
    // Department Information
    // =========================

    @Column(nullable = false)
    private String businessUnit;

    @Column(nullable = false)
    private String processName;

    // =========================
    // Status
    // =========================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnualAuditPlanStatus status;

    // =========================
    // Audit Manager
    // =========================

    // Audit Manager who created the plan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User auditManager;

    // =========================
    // Risks
    // =========================

    // Risks selected for this annual plan
    @ManyToMany
    @JoinTable(
        name = "annual_audit_plan_risks",
        joinColumns = @JoinColumn(name = "plan_id"),
        inverseJoinColumns = @JoinColumn(name = "risk_id")
    )
    private List<Risk> risks = new ArrayList<>();

    // =========================
    // Remarks
    // =========================

    @Column(length = 1000)
    private String remarks;

    // =========================
    // Rejection Reason
    // =========================

    @Column(length = 500)
    private String rejectionReason;

    // =========================
    // Audit Timestamps
    // =========================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // =========================
    // REJECTION REASON
    // =========================

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }


    // =========================
    // PRE PERSIST
    // =========================

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = AnnualAuditPlanStatus.DRAFT;
        }

        if (planId == null || planId.isBlank()) {
            planId = "AAP-" + System.currentTimeMillis();
        }
    }


    // =========================
    // PRE UPDATE
    // =========================

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public String getPlanId() {
        return planId;
    }

    public Integer getPlanYear() {
        return planYear;
    }

    public Department getDepartment() {
        return department;
    }

    public String getPlanName() {
        return planName;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getPlannedStartDate() {
        return plannedStartDate;
    }

    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }

    public String getBusinessUnit() {
        return businessUnit;
    }

    public String getProcessName() {
        return processName;
    }

    public AnnualAuditPlanStatus getStatus() {
        return status;
    }

    public User getAuditManager() {
        return auditManager;
    }

    public List<Risk> getRisks() {
        return risks;
    }

    public String getRemarks() {
        return remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }

    public void setPlanYear(Integer planYear) {
        this.planYear = planYear;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPlannedStartDate(LocalDate plannedStartDate) {
        this.plannedStartDate = plannedStartDate;
    }

    public void setPlannedEndDate(LocalDate plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
    }

    public void setBusinessUnit(String businessUnit) {
        this.businessUnit = businessUnit;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public void setStatus(AnnualAuditPlanStatus status) {
        this.status = status;
    }

    public void setAuditManager(User auditManager) {
        this.auditManager = auditManager;
    }

    public void setRisks(List<Risk> risks) {
        this.risks = risks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}