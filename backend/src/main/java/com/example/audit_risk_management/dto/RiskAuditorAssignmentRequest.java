package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import com.example.audit_risk_management.enums.AssignmentPriority;


public class RiskAuditorAssignmentRequest {

    private String riskId;

    private String employeeId;

    private LocalDate startDate;

    private LocalDate dueDate;

    private AssignmentPriority priority;

    private String comments;


    // Getters

    public String getRiskId() {
        return riskId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public AssignmentPriority getPriority() {
        return priority;
    }

    public String getComments() {
        return comments;
    }


    // Setters

    public void setRiskId(String riskId) {
        this.riskId = riskId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void setPriority(AssignmentPriority priority) {
        this.priority = priority;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}