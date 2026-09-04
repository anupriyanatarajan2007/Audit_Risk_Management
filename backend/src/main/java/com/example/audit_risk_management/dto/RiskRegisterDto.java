package com.example.audit_risk_management.dto;

import com.example.audit_risk_management.model.Department;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RiskRegisterDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Department is required")
    private Department department;

    @NotBlank(message = "Business Unit is required")
    private String businessUnit;

    @NotBlank(message = "Process Name is required")
    private String processName;

    private String remarks;
}