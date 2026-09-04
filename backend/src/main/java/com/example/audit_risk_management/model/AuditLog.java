package com.example.audit_risk_management.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who performed the action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Module where the action happened
    @Column(nullable = false, length = 100)
    private String module;

    // Action performed
    @Column(nullable = false, length = 100)
    private String action;

    // Details about the action
    @Column(length = 1000)
    private String description;

    // When the action happened
    @Column(nullable = false)
    private LocalDateTime timestamp;


    public AuditLog() {
    }


    @PrePersist
    public void prePersist() {

        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }


    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getModule() {
        return module;
    }

    public String getAction() {
        return action;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }


    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}