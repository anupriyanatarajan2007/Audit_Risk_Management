package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.Frequency;
import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.Unit;
import com.example.audit_risk_management.model.Department;

public class KriResponseDTO {

     private Long id;

    private String kriId;

    private String kriName;

    private String description;

    private Long riskId;

    private String riskCode;

    private String riskTitle;

    private RiskCategory riskCategory;

    private Department department;

    private String businessUnit;

    private Long ownerId;

    private String ownerEmployeeId;

    private String ownerName;

    private Double currentValue;

    private Double greenThreshold;

    private Double amberThreshold;

    private Double redThreshold;

    private Unit unit;

    private KriStatus status;

    private Frequency frequency;

    private String dataSource;

    private LocalDate lastUpdated;

    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public KriResponseDTO() {
    }

    public KriResponseDTO( Long id,String kriId, String kriName, String description,
            Long riskId, String riskCode, String riskTitle,
            RiskCategory riskCategory, Department department,
            String businessUnit, Long ownerId,
            String ownerEmployeeId, String ownerName,
            Double currentValue, Double greenThreshold,
            Double amberThreshold, Double redThreshold,
            Unit unit, KriStatus status,
            Frequency frequency, String dataSource,
            LocalDate lastUpdated, String remarks,
            LocalDateTime createdAt, LocalDateTime updatedAt) {

        this.id=id;
        this.kriId = kriId;
        this.kriName = kriName;
        this.description = description;
        this.riskId = riskId;
        this.riskCode = riskCode;
        this.riskTitle = riskTitle;
        this.riskCategory = riskCategory;
        this.department = department;
        this.businessUnit = businessUnit;
        this.ownerId = ownerId;
        this.ownerEmployeeId = ownerEmployeeId;
        this.ownerName = ownerName;
        this.currentValue = currentValue;
        this.greenThreshold = greenThreshold;
        this.amberThreshold = amberThreshold;
        this.redThreshold = redThreshold;
        this.unit = unit;
        this.status = status;
        this.frequency = frequency;
        this.dataSource = dataSource;
        this.lastUpdated = lastUpdated;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id=id;
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

    public Long getRiskId() {
        return riskId;
    }

    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }

    public String getRiskCode() {
        return riskCode;
    }

    public void setRiskCode(String riskCode) {
        this.riskCode = riskCode;
    }

    public String getRiskTitle() {
        return riskTitle;
    }

    public void setRiskTitle(String riskTitle) {
        this.riskTitle = riskTitle;
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

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerEmployeeId() {
        return ownerEmployeeId;
    }

    public void setOwnerEmployeeId(String ownerEmployeeId) {
        this.ownerEmployeeId = ownerEmployeeId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
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