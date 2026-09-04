package com.example.audit_risk_management.dto;

import java.time.LocalDateTime;

public class AuditLogResponseDTO {

    private Long id;

    private Long userId;

    private String userName;

    private String module;

    private String action;

    private String description;

    private LocalDateTime timestamp;


    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
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

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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