package com.example.audit_risk_management.dto;

import com.example.audit_risk_management.enums.Frequency;
import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.Unit;

public class KriRequestDTO {

    private String kriName;

    private String description;

    private Long riskId;

    private RiskCategory riskCategory;

    private Long departmentId;

    private String businessUnit;

    private Double currentValue;

    private Double greenThreshold;

    private Double amberThreshold;

    private Double redThreshold;

    private Unit unit;

    private KriStatus status;

    private Frequency frequency;

    private String dataSource;

    private String remarks;

    public KriRequestDTO() {
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

    public RiskCategory getRiskCategory() {
        return riskCategory;
    }

    public void setRiskCategory(RiskCategory riskCategory) {
        this.riskCategory = riskCategory;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(String businessUnit) {
        this.businessUnit = businessUnit;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
