package com.example.audit_risk_management.dto;

import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Long id;
    private String senderName;
    private String receiverName;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponseDTO() {
    }

    public NotificationResponseDTO(Long id, String senderName, String receiverName,
                                   String title, String message,
                                   boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.senderName = senderName;
        this.receiverName = receiverName;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}