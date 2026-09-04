package com.example.audit_risk_management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_configuration")
public class RiskConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer lowMax;

    @Column(nullable = false)
    private Integer mediumMin;

    @Column(nullable = false)
    private Integer mediumMax;

    @Column(nullable = false)
    private Integer highMin;

    @Column(nullable = false)
    private Integer highMax;

    @Column(nullable = false)
    private Integer criticalMin;


    // =========================
    // Constructors
    // =========================

    public RiskConfiguration() {
    }


    public RiskConfiguration(
            Integer lowMax,
            Integer mediumMin,
            Integer mediumMax,
            Integer highMin,
            Integer highMax,
            Integer criticalMin) {

        this.lowMax = lowMax;
        this.mediumMin = mediumMin;
        this.mediumMax = mediumMax;
        this.highMin = highMin;
        this.highMax = highMax;
        this.criticalMin = criticalMin;
    }


    // =========================
    // Getters
    // =========================

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


    // =========================
    // Setters
    // =========================

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