package com.example.audit_risk_management.service;

import java.util.List;

import com.example.audit_risk_management.enums.ReviewStatus;
import com.example.audit_risk_management.model.Review;

public interface ReviewService {

    // Create a new review
    Review createReview(Review review);

    // Get review by ID
    Review getReviewById(Long id);

    // Get review by Review ID
    Review getReviewByReviewId(String reviewId);

    // Get all reviews
    List<Review> getAllReviews();

    // Get reviews for a particular audit
    List<Review> getReviewsByAudit(Long auditId);

    // Get reviews created by a particular reviewer
    List<Review> getReviewsByReviewer(Long reviewerId);

    // Get reviews by status
    List<Review> getReviewsByStatus(ReviewStatus status);

    // Update review
    Review updateReview(Long id, Review review);

    // Delete review
    void deleteReview(Long id);
}