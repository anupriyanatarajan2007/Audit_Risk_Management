package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.Impact;
import com.example.audit_risk_management.enums.Likelihood;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.enums.RiskStatus;

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

@Entity
@Table(name = "risks")
public class Risk {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // BASIC RISK INFORMATION
    // =========================================================

    @Column(unique = true, nullable = false)
    private String riskId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;


    // =========================================================
    // ORGANIZATION INFORMATION
    // =========================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false)
    private String businessUnit;

    @Column(nullable = false)
    private String processName;

    @Column(length = 1000)
    private String remarks;


    // =========================================================
    // RISK CLASSIFICATION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskCategory category;


    // =========================================================
    // RISK ASSESSMENT
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Likelihood likelihood;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Impact impact;

    /*
     * RiskLevel is stored in the database.
     *
     * IMPORTANT:
     * The level is NOT calculated inside this entity.
     *
     * RiskServiceImpl calculates the level using
     * Admin Risk Configuration.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel level;

    /*
     * Risk score is calculated in RiskServiceImpl:
     *
     * likelihood value × impact value
     */
    @Column(nullable = false)
    private Integer riskScore;


    // =========================================================
    // RISK CONTROLS / MITIGATION
    // =========================================================

    @Column(length = 1000)
    private String existingControls;

    @Column(length = 1000)
    private String mitigationPlan;

    private LocalDate targetClosureDate;

    @Column(length = 1000)
    private String mitigationUpdate;

    private LocalDate actualClosureDate;


    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskStatus status;


    // =========================================================
    // USERS
    // =========================================================

    /*
     * User who identified the risk.
     * Usually Risk Officer.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identified_by", nullable = false)
    private User identifiedBy;


    /*
     * User to whom the risk is assigned.
     * This can be Audit Manager / Auditee / responsible user
     * depending on your workflow.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;


    // =========================================================
    // AUDIT TIMESTAMPS
    // =========================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();

        updatedAt = LocalDateTime.now();


        /*
         * Default status when a new risk is created.
         */
        if (status == null) {
            status = RiskStatus.NEW;
        }


        /*
         * Generate Risk ID automatically
         * if it was not provided.
         */
        if (riskId == null || riskId.isBlank()) {
            riskId = "RISK-" + System.currentTimeMillis();
        }
    }


    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public String getRiskId() {
        return riskId;
    }


    public String getTitle() {
        return title;
    }


    public String getDescription() {
        return description;
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


    public String getRemarks() {
        return remarks;
    }


    public RiskCategory getCategory() {
        return category;
    }


    public Likelihood getLikelihood() {
        return likelihood;
    }


    public Impact getImpact() {
        return impact;
    }


    public RiskLevel getLevel() {
        return level;
    }


    public Integer getRiskScore() {
        return riskScore;
    }


    public String getExistingControls() {
        return existingControls;
    }


    public String getMitigationPlan() {
        return mitigationPlan;
    }


    public LocalDate getTargetClosureDate() {
        return targetClosureDate;
    }


    public String getMitigationUpdate() {
        return mitigationUpdate;
    }


    public LocalDate getActualClosureDate() {
        return actualClosureDate;
    }


    public RiskStatus getStatus() {
        return status;
    }


    public User getIdentifiedBy() {
        return identifiedBy;
    }


    public User getAssignedTo() {
        return assignedTo;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }


    public void setRiskId(String riskId) {
        this.riskId = riskId;
    }


    public void setTitle(String title) {
        this.title = title;
    }


    public void setDescription(String description) {
        this.description = description;
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


    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }


    public void setCategory(RiskCategory category) {
        this.category = category;
    }


    public void setLikelihood(Likelihood likelihood) {
        this.likelihood = likelihood;
    }


    public void setImpact(Impact impact) {
        this.impact = impact;
    }


    public void setLevel(RiskLevel level) {
        this.level = level;
    }


    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }


    public void setExistingControls(String existingControls) {
        this.existingControls = existingControls;
    }


    public void setMitigationPlan(String mitigationPlan) {
        this.mitigationPlan = mitigationPlan;
    }


    public void setTargetClosureDate(LocalDate targetClosureDate) {
        this.targetClosureDate = targetClosureDate;
    }


    public void setMitigationUpdate(String mitigationUpdate) {
        this.mitigationUpdate = mitigationUpdate;
    }


    public void setActualClosureDate(LocalDate actualClosureDate) {
        this.actualClosureDate = actualClosureDate;
    }


    public void setStatus(RiskStatus status) {
        this.status = status;
    }


    public void setIdentifiedBy(User identifiedBy) {
        this.identifiedBy = identifiedBy;
    }


    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}