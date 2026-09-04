package com.example.audit_risk_management.dto;

public class AuditLogRequestDTO {

    private String module;
    private String action;
    private String description;


    // =========================
    // GETTERS
    // =========================

    public String getModule() {
        return module;
    }

    public String getAction() {
        return action;
    }

    public String getDescription() {
        return description;
    }


    // =========================
    // SETTERS
    // =========================

    public void setModule(String module) {
        this.module = module;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setDescription(String description) {
        this.description = description;
    }
} 