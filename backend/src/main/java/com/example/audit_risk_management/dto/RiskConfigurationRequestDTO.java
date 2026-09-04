package com.example.audit_risk_management.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RiskConfigurationRequestDTO {

    @NotNull(message = "Low maximum score is required")
    @Min(value = 1, message = "Low maximum score must be at least 1")
    @Max(value = 25, message = "Low maximum score cannot exceed 25")
    private Integer lowMax;

    @NotNull(message = "Medium minimum score is required")
    @Min(value = 1, message = "Medium minimum score must be at least 1")
    @Max(value = 25, message = "Medium minimum score cannot exceed 25")
    private Integer mediumMin;

    @NotNull(message = "Medium maximum score is required")
    @Min(value = 1, message = "Medium maximum score must be at least 1")
    @Max(value = 25, message = "Medium maximum score cannot exceed 25")
    private Integer mediumMax;

    @NotNull(message = "High minimum score is required")
    @Min(value = 1, message = "High minimum score must be at least 1")
    @Max(value = 25, message = "High minimum score cannot exceed 25")
    private Integer highMin;

    @NotNull(message = "High maximum score is required")
    @Min(value = 1, message = "High maximum score must be at least 1")
    @Max(value = 25, message = "High maximum score cannot exceed 25")
    private Integer highMax;

    @NotNull(message = "Critical minimum score is required")
    @Min(value = 1, message = "Critical minimum score must be at least 1")
    @Max(value = 25, message = "Critical minimum score cannot exceed 25")
    private Integer criticalMin;


    public Integer getLowMax() {
        return lowMax;
    }

    public void setLowMax(Integer lowMax) {
        this.lowMax = lowMax;
    }


    public Integer getMediumMin() {
        return mediumMin;
    }

    public void setMediumMin(Integer mediumMin) {
        this.mediumMin = mediumMin;
    }


    public Integer getMediumMax() {
        return mediumMax;
    }

    public void setMediumMax(Integer mediumMax) {
        this.mediumMax = mediumMax;
    }


    public Integer getHighMin() {
        return highMin;
    }

    public void setHighMin(Integer highMin) {
        this.highMin = highMin;
    }


    public Integer getHighMax() {
        return highMax;
    }

    public void setHighMax(Integer highMax) {
        this.highMax = highMax;
    }


    public Integer getCriticalMin() {
        return criticalMin;
    }

    public void setCriticalMin(Integer criticalMin) {
        this.criticalMin = criticalMin;
    }
}