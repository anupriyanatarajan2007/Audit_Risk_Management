package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.AssignmentPriority;
import com.example.audit_risk_management.enums.AssignmentStatus;

public class RiskAuditorAssignmentResponse {

    private Long id;

    private String riskId;

    private String riskTitle;

    private String employeeId;

    private String auditorEmail;

    private String assignedByEmployeeId;

    private LocalDateTime assignedAt;

    private LocalDate startDate;

    private LocalDate dueDate;

    private AssignmentStatus status;

    private AssignmentPriority priority;

    private String comments;


    // Getters

    public Long getId() {
        return id;
    }

    public String getRiskId() {
        return riskId;
    }

    public String getRiskTitle() {
        return riskTitle;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getAuditorEmail() {
        return auditorEmail;
    }

    public String getAssignedByEmployeeId() {
        return assignedByEmployeeId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public AssignmentPriority getPriority() {
        return priority;
    }

    public String getComments() {
        return comments;
    }


    // Setters

    public void setId(Long id) {
        this.id = id;
    }

    public void setRiskId(String riskId) {
        this.riskId = riskId;
    }

    public void setRiskTitle(String riskTitle) {
        this.riskTitle = riskTitle;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public void setAuditorEmail(String auditorEmail) {
        this.auditorEmail = auditorEmail;
    }

    public void setAssignedByEmployeeId(String assignedByEmployeeId) {
        this.assignedByEmployeeId = assignedByEmployeeId;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public void setPriority(AssignmentPriority priority) {
        this.priority = priority;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
