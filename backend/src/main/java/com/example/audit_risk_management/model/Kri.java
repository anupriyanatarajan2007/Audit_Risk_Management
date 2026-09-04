package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.Frequency;
import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.Unit;

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
@Table(name="kri")
public class Kri {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    private String kriId;

    @Column(nullable=false)
    private String kriName;

    @Column(length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "risk_id", nullable = false)
    private Risk risk;

    @Enumerated(EnumType.STRING)
    private RiskCategory riskCategory;
    

  @ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id")
private Department department;

    private String businessUnit;

    @ManyToOne
    @JoinColumn(name="owner_id")
    private User owner;

    private Double currentValue;

    private Double greenThreshold;

    private Double amberThreshold;

    private Double redThreshold;

     @Enumerated(EnumType.STRING)
    private Unit unit;

    @Enumerated(EnumType.STRING)
    private KriStatus status;

    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    private String dataSource;

    private LocalDate lastUpdated;

     @Column(length = 1000)
    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastUpdated = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
        lastUpdated = LocalDate.now();
    }
        public Kri() {
    }

    // ---------- Getters & Setters ----------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKriId() {
        return kriId;
    }

    public void setKriId(String kriId) {
        this.kriId = kriId;
    }

    public String getKriName() {
        return kriName;
    }

    public void setKriName(String kriName) {
        this.kriName = kriName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Risk getRisk() {
        return risk;
    }

    public void setRisk(Risk risk) {
        this.risk = risk;
    }

    public RiskCategory getRiskCategory() {
        return riskCategory;
    }

    public void setRiskCategory(RiskCategory riskCategory) {
        this.riskCategory = riskCategory;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(String businessUnit) {
        this.businessUnit = businessUnit;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }

    public Double getGreenThreshold() {
        return greenThreshold;
    }

    public void setGreenThreshold(Double greenThreshold) {
        this.greenThreshold = greenThreshold;
    }

    public Double getAmberThreshold() {
        return amberThreshold;
    }

    public void setAmberThreshold(Double amberThreshold) {
        this.amberThreshold = amberThreshold;
    }

    public Double getRedThreshold() {
        return redThreshold;
    }

    public void setRedThreshold(Double redThreshold) {
        this.redThreshold = redThreshold;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public KriStatus getStatus() {
        return status;
    }

    public void setStatus(KriStatus status) {
        this.status = status;
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }

    public LocalDate getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDate lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
