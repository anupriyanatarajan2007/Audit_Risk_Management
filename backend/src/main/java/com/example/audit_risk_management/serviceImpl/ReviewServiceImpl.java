package com.example.audit_risk_management.serviceImpl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.enums.ReviewStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Review;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.ReviewRepository;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.ReviewService;

import org.springframework.security.core.Authentication;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {


private final ReviewRepository reviewRepository;
private final AuditRepository auditRepository;
private final RiskRepository riskRepository;
private final UserRepo userRepository;

public ReviewServiceImpl(
        ReviewRepository reviewRepository,
        AuditRepository auditRepository,
        RiskRepository riskRepository,
        UserRepo userRepository) {

    this.reviewRepository = reviewRepository;
    this.auditRepository = auditRepository;
    this.riskRepository = riskRepository;
    this.userRepository = userRepository;
}


// ============================================================
// CREATE REVIEW
// ============================================================

@Override
public Review createReview(Review review) {

    if (review == null) {
        throw new RuntimeException("Review cannot be null");
    }

    // ========================================================
    // GET LOGGED-IN USER
    // ========================================================

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    if (authentication == null
            || authentication.getName() == null
            || authentication.getName().isBlank()) {

        throw new RuntimeException(
                "Authenticated user not found");
    }

    String email =
            authentication.getName();

    User reviewer =
            userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Logged-in user not found: "
                                            + email));


    // ========================================================
    // ROLE VALIDATION
    // ========================================================

    if (reviewer.getRole() == null) {

        throw new RuntimeException(
                "User role is not assigned");
    }

    String roleName =
            reviewer.getRole().getName();

    boolean authorized =
            "COMPLIANCE_OFFICER"
                    .equalsIgnoreCase(roleName)
            || "AUDIT_MANAGER"
                    .equalsIgnoreCase(roleName)
            || "CHIEF_AUDIT_EXECUTIVE"
                    .equalsIgnoreCase(roleName)
            || "SYSTEM_ADMINISTRATOR"
                    .equalsIgnoreCase(roleName);

    if (!authorized) {

        throw new RuntimeException(
                "User is not authorized to create a review");
    }


    // ========================================================
    // AUDIT VALIDATION
    // ========================================================

    if (review.getAudit() == null
            || review.getAudit().getId() == null) {

        throw new RuntimeException(
                "Valid Audit ID is required");
    }

    Long auditId =
            review.getAudit().getId();

    Audit audit =
            auditRepository.findById(auditId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Audit not found with ID: "
                                            + auditId));


    // ========================================================
    // RISK VALIDATION
    // ========================================================

    if (review.getRisk() == null
            || review.getRisk().getId() == null) {

        throw new RuntimeException(
                "Valid Risk ID is required");
    }

    Long riskId =
            review.getRisk().getId();

    Risk risk =
            riskRepository.findById(riskId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Risk not found with ID: "
                                            + riskId));


    // ========================================================
    // ONE REVIEW PER RISK
    // ========================================================

    List<Review> existingReviewsForRisk =
            reviewRepository.findByRiskWithDetails(risk);

    if (!existingReviewsForRisk.isEmpty()) {

        throw new RuntimeException(
                "A compliance review already exists for this risk "
                        + "(Risk ID: "
                        + risk.getRiskId()
                        + "). Please update the existing review "
                        + "instead of creating a new one.");
    }


    // ========================================================
    // SET VERIFIED ENTITIES
    // ========================================================

    review.setAudit(audit);
    review.setRisk(risk);

    // Logged-in user becomes reviewer
    review.setReviewedBy(reviewer);


    // ========================================================
    // DEFAULT STATUS
    // ========================================================

    if (review.getStatus() == null) {

        review.setStatus(
                ReviewStatus.PENDING);
    }


    // ========================================================
    // SAVE
    // ========================================================

    Review saved =
            reviewRepository.save(review);


    // ========================================================
    // RE-FETCH WITH DETAILS
    // ========================================================

    return reviewRepository
            .findByIdWithDetails(saved.getId())
            .orElse(saved);
}


// ============================================================
// GET REVIEW BY ID
// ============================================================

@Override
@Transactional(readOnly = true)
public Review getReviewById(Long id) {

    return reviewRepository
            .findByIdWithDetails(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Review not found with ID: "
                                    + id));
}


// ============================================================
// GET REVIEW BY REVIEW ID
// ============================================================

@Override
@Transactional(readOnly = true)
public Review getReviewByReviewId(
        String reviewId) {

    return reviewRepository
            .findByReviewIdWithDetails(reviewId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Review not found with Review ID: "
                                    + reviewId));
}


// ============================================================
// GET ALL REVIEWS
// ============================================================

@Override
@Transactional(readOnly = true)
public List<Review> getAllReviews() {

    return reviewRepository
            .findAllWithDetails();
}


// ============================================================
// GET REVIEWS BY AUDIT
// ============================================================

@Override
@Transactional(readOnly = true)
public List<Review> getReviewsByAudit(
        Long auditId) {

    Audit audit =
            auditRepository.findById(auditId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Audit not found with ID: "
                                            + auditId));

    return reviewRepository
            .findByAuditWithDetails(audit);
}


// ============================================================
// GET REVIEWS BY REVIEWER
// ============================================================

@Override
@Transactional(readOnly = true)
public List<Review> getReviewsByReviewer(
        Long reviewerId) {

    User reviewer =
            userRepository.findById(reviewerId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Reviewer not found with ID: "
                                            + reviewerId));

    return reviewRepository
            .findByReviewedByWithDetails(reviewer);
}


// ============================================================
// GET REVIEWS BY STATUS
// ============================================================

@Override
@Transactional(readOnly = true)
public List<Review> getReviewsByStatus(
        ReviewStatus status) {

    if (status == null) {

        throw new RuntimeException(
                "Review status is required");
    }

    return reviewRepository
            .findByStatusWithDetails(status);
}


// ============================================================
// UPDATE REVIEW
// ============================================================

@Override
public Review updateReview(
        Long id,
        Review updatedReview) {

    Review existingReview =
            reviewRepository
                    .findByIdWithDetails(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Review not found with ID: "
                                            + id));


    // ========================================================
    // UPDATE COMMENTS
    // ========================================================

    if (updatedReview.getComments() != null) {

        existingReview.setComments(
                updatedReview.getComments());
    }


    // ========================================================
    // UPDATE STATUS
    // ========================================================

    if (updatedReview.getStatus() != null) {

        existingReview.setStatus(
                updatedReview.getStatus());
    }


    // ========================================================
    // UPDATE REVIEWED DATE
    // ========================================================

    if (updatedReview.getReviewedAt() != null) {

        existingReview.setReviewedAt(
                updatedReview.getReviewedAt());
    }


    // ========================================================
    // SAVE
    // ========================================================

    Review saved =
            reviewRepository.save(
                    existingReview);


    // ========================================================
    // RE-FETCH WITH DETAILS
    // ========================================================

    return reviewRepository
            .findByIdWithDetails(saved.getId())
            .orElse(saved);
}


// ============================================================
// DELETE REVIEW
// ============================================================

@Override
public void deleteReview(Long id) {

    if (!reviewRepository.existsById(id)) {

        throw new RuntimeException(
                "Review not found with ID: "
                        + id);
    }

    reviewRepository.deleteById(id);
}

}
