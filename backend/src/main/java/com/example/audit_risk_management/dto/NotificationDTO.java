package com.example.audit_risk_management.dto;

public class NotificationDTO {

    private Long receiverId;
    private String title;
    private String message;

    public NotificationDTO() {
    }

    public NotificationDTO(Long receiverId, String title, String message) {
        this.receiverId = receiverId;
        this.title = title;
        this.message = message;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
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
}