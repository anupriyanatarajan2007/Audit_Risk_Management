package com.example.audit_risk_management.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.Effectiveness;
import com.example.audit_risk_management.enums.MitigationStatus;
import com.example.audit_risk_management.enums.MitigationType;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "mitigations")
public class Mitigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String mitigationId;

    @Column(nullable = false)
    private String mitigationTitle;

    @Column(length = 1000, nullable = false)
    private String mitigationDescription;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_id", nullable = false, unique = true)
    private Risk risk;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MitigationType mitigationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    private LocalDate targetDate;

    private LocalDate completedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MitigationStatus status = MitigationStatus.PLANNED;

    @Enumerated(EnumType.STRING)
    private Effectiveness effectiveness;

    @Column(precision = 12, scale = 2)
    private BigDecimal cost;

    @Size(max = 500)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = MitigationStatus.PLANNED;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Mitigation() {
    }

    // ---------------- Getters & Setters ----------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMitigationId() {
        return mitigationId;
    }

    public void setMitigationId(String mitigationId) {
        this.mitigationId = mitigationId;
    }

    public String getMitigationTitle() {
        return mitigationTitle;
    }

    public void setMitigationTitle(String mitigationTitle) {
        this.mitigationTitle = mitigationTitle;
    }

    public String getMitigationDescription() {
        return mitigationDescription;
    }

    public void setMitigationDescription(String mitigationDescription) {
        this.mitigationDescription = mitigationDescription;
    }

    public Risk getRisk() {
        return risk;
    }

    public void setRisk(Risk risk) {
        this.risk = risk;
    }

    public MitigationType getMitigationType() {
        return mitigationType;
    }

    public void setMitigationType(MitigationType mitigationType) {
        this.mitigationType = mitigationType;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public MitigationStatus getStatus() {
        return status;
    }

    public void setStatus(MitigationStatus status) {
        this.status = status;
    }

    public Effectiveness getEffectiveness() {
        return effectiveness;
    }

    public void setEffectiveness(Effectiveness effectiveness) {
        this.effectiveness = effectiveness;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}