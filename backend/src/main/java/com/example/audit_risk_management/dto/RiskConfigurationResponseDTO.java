package com.example.audit_risk_management.dto;

public class RiskConfigurationResponseDTO {

    private Long id;

    private Integer lowMax;

    private Integer mediumMin;

    private Integer mediumMax;

    private Integer highMin;

    private Integer highMax;

    private Integer criticalMin;


    public RiskConfigurationResponseDTO() {
    }


    public RiskConfigurationResponseDTO(
            Long id,
            Integer lowMax,
            Integer mediumMin,
            Integer mediumMax,
            Integer highMin,
            Integer highMax,
            Integer criticalMin) {

        this.id = id;
        this.lowMax = lowMax;
        this.mediumMin = mediumMin;
        this.mediumMax = mediumMax;
        this.highMin = highMin;
        this.highMax = highMax;
        this.criticalMin = criticalMin;
    }


    public Long getId() {
        return id;
    }

    public Integer getLowMax() {
        return lowMax;
    }

    public Integer getMediumMin() {
        return mediumMin;
    }

    public Integer getMediumMax() {
        return mediumMax;
    }

    public Integer getHighMin() {
        return highMin;
    }

    public Integer getHighMax() {
        return highMax;
    }

    public Integer getCriticalMin() {
        return criticalMin;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setLowMax(Integer lowMax) {
        this.lowMax = lowMax;
    }

    public void setMediumMin(Integer mediumMin) {
        this.mediumMin = mediumMin;
    }

    public void setMediumMax(Integer mediumMax) {
        this.mediumMax = mediumMax;
    }

    public void setHighMin(Integer highMin) {
        this.highMin = highMin;
    }

    public void setHighMax(Integer highMax) {
        this.highMax = highMax;
    }

    public void setCriticalMin(Integer criticalMin) {
        this.criticalMin = criticalMin;
    }
}