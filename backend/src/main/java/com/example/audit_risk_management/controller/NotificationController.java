
package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.NotificationDTO;
import com.example.audit_risk_management.dto.NotificationResponseDTO;
import com.example.audit_risk_management.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    // =========================================================
    // SEND NOTIFICATION
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_SEND')")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> sendNotification(
            @RequestBody NotificationDTO notificationDTO) {

        NotificationResponseDTO response =
                notificationService.sendNotification(notificationDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Notification sent successfully",
                        response));
    }


    // =========================================================
    // GET LOGGED-IN USER NOTIFICATIONS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getMyNotifications() {

        List<NotificationResponseDTO> notifications =
                notificationService.getMyNotifications();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Notifications fetched successfully",
                        notifications));
    }


    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasAuthority('NOTIFICATION_MARK_READ')")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> markAsRead(
            @PathVariable Long notificationId) {

        NotificationResponseDTO response =
                notificationService.markAsRead(notificationId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Notification marked as read",
                        response));
    }


    // =========================================================
    // GET UNREAD NOTIFICATION COUNT
    // =========================================================

    @GetMapping("/unread-count")
    @PreAuthorize("hasAuthority('NOTIFICATION_UNREAD_COUNT')")
    public ResponseEntity<ApiResponse<Long>> getUnreadNotificationCount() {

        long count =
                notificationService.getUnreadNotificationCount();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Unread notification count",
                        count));
    }
}
