
package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import com.example.audit_risk_management.enums.Impact;
import com.example.audit_risk_management.enums.Likelihood;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.model.Department;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RiskRequestDTO {

    // =========================================================
    // BASIC INFORMATION
    // =========================================================

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000)
    private String description;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotBlank(message = "Business Unit is required")
    private String businessUnit;

    @NotBlank(message = "Process Name is required")
    private String processName;

    @Size(max = 1000)
    private String remarks;


    // =========================================================
    // RISK ASSESSMENT
    // =========================================================

    @NotNull(message = "Risk Category is required")
    private RiskCategory category;

    @NotNull(message = "Likelihood is required")
    private Likelihood likelihood;

    @NotNull(message = "Impact is required")
    private Impact impact;


    // =========================================================
    // CONTROLS / MITIGATION
    // =========================================================

    @Size(max = 1000)
    private String existingControls;

    @Size(max = 1000)
    private String mitigationPlan;

    @FutureOrPresent(
        message = "Target Closure Date cannot be in the past"
    )
    private LocalDate targetClosureDate;


    // =========================================================
    // OPTIONAL ASSIGNMENT
    // =========================================================

    private Long assignedToId;


    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public RiskRequestDTO() {
    }

    public RiskRequestDTO(
        String title,
        String description,
        Long departmentId,
        String businessUnit,
        String processName,
        String remarks,
        RiskCategory category,
        Likelihood likelihood,
        Impact impact,
        String existingControls,
        String mitigationPlan,
        LocalDate targetClosureDate,
        Long assignedToId) {

    this.title = title;
    this.description = description;
    this.departmentId = departmentId;
    this.businessUnit = businessUnit;
    this.processName = processName;
    this.remarks = remarks;
    this.category = category;
    this.likelihood = likelihood;
    this.impact = impact;
    this.existingControls = existingControls;
    this.mitigationPlan = mitigationPlan;
    this.targetClosureDate = targetClosureDate;
    this.assignedToId = assignedToId;
}

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public RiskCategory getCategory() {
        return category;
    }

    public void setCategory(RiskCategory category) {
        this.category = category;
    }

    public Likelihood getLikelihood() {
        return likelihood;
    }

    public void setLikelihood(Likelihood likelihood) {
        this.likelihood = likelihood;
    }

    public Impact getImpact() {
        return impact;
    }

    public void setImpact(Impact impact) {
        this.impact = impact;
    }

    public String getExistingControls() {
        return existingControls;
    }

    public void setExistingControls(String existingControls) {
        this.existingControls = existingControls;
    }

    public String getMitigationPlan() {
        return mitigationPlan;
    }

    public void setMitigationPlan(String mitigationPlan) {
        this.mitigationPlan = mitigationPlan;
    }

    public LocalDate getTargetClosureDate() {
        return targetClosureDate;
    }

    public void setTargetClosureDate(LocalDate targetClosureDate) {
        this.targetClosureDate = targetClosureDate;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }


    // =========================================================
    // TO STRING
    // =========================================================

    @Override
    public String toString() {
        return "RiskRequestDTO{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", department=" + departmentId +
                ", businessUnit='" + businessUnit + '\'' +
                ", processName='" + processName + '\'' +
                ", remarks='" + remarks + '\'' +
                ", category=" + category +
                ", likelihood=" + likelihood +
                ", impact=" + impact +
                ", existingControls='" + existingControls + '\'' +
                ", mitigationPlan='" + mitigationPlan + '\'' +
                ", targetClosureDate=" + targetClosureDate +
                ", assignedToId=" + assignedToId +
                '}';
    }
}