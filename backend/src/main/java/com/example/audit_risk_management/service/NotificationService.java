package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.dto.NotificationDTO;
import com.example.audit_risk_management.dto.NotificationResponseDTO;

public interface NotificationService {

    NotificationResponseDTO sendNotification(NotificationDTO notificationDTO);

    List<NotificationResponseDTO> getMyNotifications();

    NotificationResponseDTO markAsRead(Long notificationId);

    long getUnreadNotificationCount();
}