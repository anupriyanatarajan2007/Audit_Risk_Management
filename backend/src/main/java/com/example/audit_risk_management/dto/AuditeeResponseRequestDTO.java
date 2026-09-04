package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuditeeResponseRequestDTO {

    @NotNull(message = "Finding ID is required")
    private Long findingId;

    @NotNull(message = "Auditee ID is required")
    private Long auditeeId;

    @NotBlank(message = "Response is required")
    private String responseText;

    private String rootCause;

    private String correctiveAction;

    @FutureOrPresent(message = "Target completion date cannot be in the past")
    private LocalDate targetCompletionDate;

    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public Long getAuditeeId() {
        return auditeeId;
    }

    public void setAuditeeId(Long auditeeId) {
        this.auditeeId = auditeeId;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getCorrectiveAction() {
        return correctiveAction;
    }

    public void setCorrectiveAction(String correctiveAction) {
        this.correctiveAction = correctiveAction;
    }

    public LocalDate getTargetCompletionDate() {
        return targetCompletionDate;
    }

    public void setTargetCompletionDate(LocalDate targetCompletionDate) {
        this.targetCompletionDate = targetCompletionDate;
    }
}