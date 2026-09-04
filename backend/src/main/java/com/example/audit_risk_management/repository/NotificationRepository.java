package com.example.audit_risk_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.Notification;
import com.example.audit_risk_management.model.User;


@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications of a receiver
    List<Notification> findByReceiverOrderByCreatedAtDesc(User receiver);

    // Get unread notifications
    List<Notification> findByReceiverAndIsReadFalseOrderByCreatedAtDesc(User receiver);

    // Count unread notifications
    long countByReceiverAndIsReadFalse(User receiver);
}