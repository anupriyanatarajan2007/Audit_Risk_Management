package com.example.audit_risk_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.AssignmentStatus;

public class AuditeeAssignmentResponseDTO {


    private Long id;

    private Long auditId;
    private String auditName;

    private Long auditeeId;
    private String auditeeName;
    private String auditeeEmail;
    private String auditeeEmployeeId;

    private Long assignedById;
    private String assignedByName;

    private LocalDate assignedDate;
    private LocalDate startDate;
    private LocalDate dueDate;

    private AssignmentStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public Long getAuditId() {
        return auditId;
    }

    public String getAuditName() {
        return auditName;
    }

    public Long getAuditeeId() {
        return auditeeId;
    }

    public String getAuditeeName() {
        return auditeeName;
    }

    public String getAuditeeEmail() {
        return auditeeEmail;
    }

    public String getAuditeeEmployeeId() {
        return auditeeEmployeeId;
    }

    public Long getAssignedById() {
        return assignedById;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public void setAuditName(String auditName) {
        this.auditName = auditName;
    }

    public void setAuditeeId(Long auditeeId) {
        this.auditeeId = auditeeId;
    }

    public void setAuditeeName(String auditeeName) {
        this.auditeeName = auditeeName;
    }

    public void setAuditeeEmail(String auditeeEmail) {
        this.auditeeEmail = auditeeEmail;
    }

    public void setAuditeeEmployeeId(String auditeeEmployeeId) {
        this.auditeeEmployeeId = auditeeEmployeeId;
    }

    public void setAssignedById(Long assignedById) {
        this.assignedById = assignedById;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}