package com.example.audit_risk_management.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.AssignmentPriority;
import com.example.audit_risk_management.enums.AssignmentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_auditor_assignments")
public class RiskAuditorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_id", nullable = false)
    private Risk risk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id", nullable = false)
    private User auditor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentPriority priority;

    @Column(length = 2000)
    private String comments;


    // ================= PRE PERSIST =================

    @PrePersist
    public void onCreate() {

        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = AssignmentStatus.ASSIGNED;
        }

        if (priority == null) {
            priority = AssignmentPriority.MEDIUM;
        }
    }


    // ================= GETTERS =================

    public Long getId() {
        return id;
    }

    public Risk getRisk() {
        return risk;
    }

    public User getAuditor() {
        return auditor;
    }

    public User getAssignedBy() {
        return assignedBy;
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


    // ================= SETTERS =================

    public void setId(Long id) {
        this.id = id;
    }

    public void setRisk(Risk risk) {
        this.risk = risk;
    }

    public void setAuditor(User auditor) {
        this.auditor = auditor;
    }

    public void setAssignedBy(User assignedBy) {
        this.assignedBy = assignedBy;
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