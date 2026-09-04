package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.NotificationDTO;
import com.example.audit_risk_management.dto.NotificationResponseDTO;
import com.example.audit_risk_management.model.Notification;
import com.example.audit_risk_management.model.NotificationConfiguration;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.NotificationConfigurationRepository;
import com.example.audit_risk_management.repository.NotificationRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepo userRepository;
    private final NotificationConfigurationRepository
            notificationConfigurationRepository;


    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepo userRepository,
            NotificationConfigurationRepository
                    notificationConfigurationRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationConfigurationRepository =
                notificationConfigurationRepository;
    }


    // =========================================================
    // GET LOGGED-IN USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }


    // =========================================================
    // GET NOTIFICATION CONFIGURATION
    // =========================================================

    private NotificationConfiguration getConfiguration() {

        return notificationConfigurationRepository
                .findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {

                    NotificationConfiguration configuration =
                            new NotificationConfiguration();

                    configuration.setEmailNotificationsEnabled(true);
                    configuration.setInAppNotificationsEnabled(true);
                    configuration.setAuditNotificationsEnabled(true);
                    configuration.setRiskNotificationsEnabled(true);
                    configuration.setComplianceNotificationsEnabled(true);
                    configuration.setReminderNotificationsEnabled(true);
                    configuration.setReminderDaysBeforeDue(7);

                    return notificationConfigurationRepository
                            .save(configuration);
                });
    }


    // =========================================================
    // SEND NOTIFICATION
    // =========================================================

    @Override
    public NotificationResponseDTO sendNotification(
            NotificationDTO dto) {

        // -----------------------------------------------------
        // GET CONFIGURATION
        // -----------------------------------------------------

        NotificationConfiguration configuration =
                getConfiguration();


        // -----------------------------------------------------
        // CHECK IN-APP NOTIFICATION
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(
                configuration.getInAppNotificationsEnabled())) {

            throw new RuntimeException(
                    "In-App notifications are disabled by administrator"
            );
        }


        // -----------------------------------------------------
        // GET SENDER
        // -----------------------------------------------------

        User sender = getCurrentUser();


        // -----------------------------------------------------
        // GET RECEIVER
        // -----------------------------------------------------

        User receiver = userRepository
                .findById(dto.getReceiverId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Receiver not found"
                        )
                );


        // -----------------------------------------------------
        // CREATE NOTIFICATION
        // -----------------------------------------------------

        Notification notification =
                new Notification();

        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setRead(false);
        notification.setCreatedAt(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Notification saved =
                notificationRepository.save(notification);


        return mapToDTO(saved);
    }


    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @Override
    public List<NotificationResponseDTO>
    getMyNotifications() {

        User receiver = getCurrentUser();

        return notificationRepository
                .findByReceiverOrderByCreatedAtDesc(receiver)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // =========================================================
    // MARK AS READ
    // =========================================================

    @Override
    public NotificationResponseDTO markAsRead(
            Long notificationId) {

        User receiver = getCurrentUser();

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK OWNER
        // -----------------------------------------------------

        if (!notification.getReceiver()
                .getId()
                .equals(receiver.getId())) {

            throw new RuntimeException(
                    "Access Denied"
            );
        }


        notification.setRead(true);
        notification.setReadAt(
                LocalDateTime.now()
        );


        Notification updated =
                notificationRepository.save(notification);

        return mapToDTO(updated);
    }


    // =========================================================
    // UNREAD NOTIFICATION COUNT
    // =========================================================

    @Override
    public long getUnreadNotificationCount() {

        User receiver = getCurrentUser();

        return notificationRepository
                .countByReceiverAndIsReadFalse(receiver);
    }


    // =========================================================
    // DTO MAPPER
    // =========================================================

    private NotificationResponseDTO mapToDTO(
            Notification notification) {

        NotificationResponseDTO dto =
                new NotificationResponseDTO();

        dto.setId(notification.getId());

        dto.setSenderName(
                notification.getSender()
                        .getProfile()
                        .getFirstName()
        );

        dto.setReceiverName(
                notification.getReceiver()
                        .getProfile()
                        .getFirstName()
        );

        dto.setTitle(
                notification.getTitle()
        );

        dto.setMessage(
                notification.getMessage()
        );

        dto.setRead(
                notification.isRead()
        );

        dto.setCreatedAt(
                notification.getCreatedAt()
        );

        return dto;
    }
}